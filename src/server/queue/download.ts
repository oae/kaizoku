import { Prisma } from '@prisma/client';
import { Job, Queue, Worker } from 'bullmq';
import { sanitizer } from '../../utils';
import { prisma } from '../db/client';
import { downloadChapter, getChapterFromLocal } from '../utils/mangal';
import { notificationQueue } from './notify';

const mangaWithLibraryAndMetadata = Prisma.validator<Prisma.MangaArgs>()({
  include: { library: true, metadata: true },
});

export type MangaWithLibraryAndMetadata = Prisma.MangaGetPayload<typeof mangaWithLibraryAndMetadata>;
export interface IDownloadWorkerData {
  manga: MangaWithLibraryAndMetadata;
  chapterIndex: number;
}

export const downloadWorker = new Worker(
  'downloadQueue',
  async (job: Job) => {
    const { chapterIndex, manga }: IDownloadWorkerData = job.data;
    try {
      const filePath = await downloadChapter(manga.title, manga.source, chapterIndex, manga.library.path);
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
