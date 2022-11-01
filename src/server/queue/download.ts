import { Prisma } from '@prisma/client';
import { Job, Queue, Worker } from 'bullmq';
import { sanitizer } from '../../utils';
import { logger } from '../../utils/logging';
import { prisma } from '../db/client';
import { downloadChapter, getChapterFromLocal, getMangaPath, removeManga } from '../utils/mangal';
import { notificationQueue } from './notify';

const mangaWithLibraryAndMetadata = Prisma.validator<Prisma.MangaArgs>()({
  include: { library: true, metadata: true },
});

type MangaWithLibraryAndMetadata = Prisma.MangaGetPayload<typeof mangaWithLibraryAndMetadata>;

const mangaWithChaptersAndLibrary = Prisma.validator<Prisma.MangaArgs>()({
  include: { chapters: true, library: true },
});

type MangaWithChaptersAndLibrary = Prisma.MangaGetPayload<typeof mangaWithChaptersAndLibrary>;
export interface IDownloadWorkerData {
  manga: MangaWithLibraryAndMetadata;
  chapterIndex: number;
}

export const downloadWorker = new Worker(
  'downloadQueue',
  async (job: Job) => {
    const { chapterIndex, manga }: IDownloadWorkerData = job.data;
    let filePath;
    try {
      const mangaInDb = await prisma.manga.findUnique({ where: { id: manga.id } });
      if (!mangaInDb) {
        job.log(`Manga ${manga.title} with id ${manga.id} is removed from db.`);
        downloadWorker.on('completed', async ({ id }) => {
          if (id === job.id) {
            await job.remove();
          }
        });
        return;
      }
      filePath = await downloadChapter(manga.title, manga.source, chapterIndex, manga.library.path);
      const chapter = await getChapterFromLocal(filePath);

      await prisma.chapter.deleteMany({
        where: {
          mangaId: manga.id,
          index: chapterIndex,
        },
      });

      const chapterInDb = await prisma.chapter.create({
        data: {
          ...chapter,
          mangaId: manga.id,
        },
      });
      await notificationQueue.add(`notify_${sanitizer(manga.title)}_${chapterInDb.id}`, {
        chapterIndex,
        chapterFileName: chapter.fileName,
        mangaTitle: manga.title,
        source: manga.source,
        url: manga.metadata.urls.find((url) => url.includes('anilist')),
      });
      await job.updateProgress(100);
    } catch (err) {
      await job.log(`${err}`);
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2003' && filePath) {
        await removeManga(getMangaPath(manga.library.path, manga.title));
        await job.log(`Removed ${manga.title} folder because it was not found in db`);
      }
      throw err;
    }
  },
  {
    concurrency: 5,
    connection: {
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
    },
  },
);

export const downloadQueue = new Queue('downloadQueue', {
  connection: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
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
