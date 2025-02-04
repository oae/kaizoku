import { Prisma } from '@prisma/client';
import { Job, Queue, Worker } from 'bullmq';
import { sanitizer } from '../../utils';
import { logger } from '../../utils/logging';
import { prisma } from '../db/client';
import { downloadChapter, getChapterFromLocal } from '../utils/mangal';
import { integrationQueue } from './integration';
import { notificationQueue } from './notify';

const mangaWithChaptersAndLibrary = Prisma.validator<Prisma.MangaArgs>()({
  include: { chapters: true, library: true },
});

type MangaWithChaptersAndLibrary = Prisma.MangaGetPayload<typeof mangaWithChaptersAndLibrary>;
export interface IDownloadWorkerData {
  mangaId: number;
  chapterIndex: number;
}

export const downloadWorker = new Worker(
  'downloadQueue',
  async (job: Job) => {
    const { chapterIndex, mangaId }: IDownloadWorkerData = job.data;
    let filePath;
    try {
      const mangaInDb = await prisma.manga.findUnique({
        where: { id: mangaId },
        include: { library: true, metadata: true },
      });
      if (!mangaInDb) {
        job.log(`Manga with id ${mangaId} is removed from db.`);
        downloadWorker.on('completed', async ({ id }) => {
          if (id === job.id) {
            await job.remove();
          }
        });
        return;
      }
      filePath = await downloadChapter(mangaInDb.title, mangaInDb.source, chapterIndex, mangaInDb.library.path);
      const chapter = await getChapterFromLocal(filePath);

      await prisma.chapter.deleteMany({
        where: {
          mangaId: mangaInDb.id,
          index: chapterIndex,
        },
      });

      const chapterInDb = await prisma.chapter.create({
        data: {
          ...chapter,
          mangaId: mangaInDb.id,
        },
      });
      await notificationQueue.add(`notify_${sanitizer(mangaInDb.title)}_${chapterInDb.id}`, {
        chapterIndex,
        chapterFileName: chapter.fileName,
        mangaTitle: mangaInDb.title,
        source: mangaInDb.source,
        url: mangaInDb.metadata.urls.find((url) => url.includes('anilist')),
      });
      await integrationQueue.add('run_integrations', null);
      await job.updateProgress(100);
    } catch (err) {
      await job.log(`${err}`);
      throw err;
    }
  },
  {
    concurrency: 5,
    connection: {
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      username: parseString(process.env.REDIS_USER || null),
      password: parseString(process.env.REDIS_PASS || null),
    },
  },
);

export const downloadQueue = new Queue('downloadQueue', {
  connection: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    username: parseString(process.env.REDIS_USER || null),
    password: parseString(process.env.REDIS_PASS || null),
  },
  defaultJobOptions: {
    attempts: 20,
    backoff: {
      type: 'fixed',
      delay: 1000 * 60 * 2,
    },
  },
});

export const removeDownloadJobs = async (manga: MangaWithChaptersAndLibrary) => {
  await Promise.all(
    manga.chapters.map(async (chapter) => {
      const jobId = `${sanitizer(manga.title)}_${chapter.index}_download`;
      try {
        const job = await downloadQueue.getJob(jobId);
        if (job) {
          await job.remove();
        }
      } catch (err) {
        logger.error(`job could not be cancelled. err: ${err}`);
      }
    }),
  );
};
