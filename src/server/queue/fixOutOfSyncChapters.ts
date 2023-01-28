import { Job, Queue, Worker } from 'bullmq';
import path from 'path';
import { sanitizer } from '../../utils';
import { prisma } from '../db/client';
import { removeChapter } from '../utils/mangal';
import { schedule } from './checkChapters';

export interface IFixOutOfSyncChaptersWorkerData {
  mangaId: number;
}

export const fixOutOfSyncChaptersWorker = new Worker(
  'fixOutOfSyncChaptersQueue',
  async (job: Job) => {
    const { mangaId }: IFixOutOfSyncChaptersWorkerData = job.data;
    try {
      const mangaInDb = await prisma.manga.findUniqueOrThrow({
        include: { library: true, outOfSyncChapters: true, chapters: true, metadata: true },
        where: { id: mangaId },
      });
      const mangaPath = path.resolve(mangaInDb.library.path, sanitizer(mangaInDb.title));

      await Promise.all(
        mangaInDb.outOfSyncChapters.map(async (outOfSyncChapter) => {
          const chapter = mangaInDb.chapters.find((curr) => curr.id === outOfSyncChapter.id);
          if (!chapter) {
            return;
          }
          await removeChapter(mangaPath, chapter.fileName);
          await prisma.outOfSyncChapter.delete({ where: { id: outOfSyncChapter.id } });
          await prisma.chapter.delete({ where: { id: outOfSyncChapter.id } });
        }),
      );

      await schedule(mangaInDb, true);
      await job.updateProgress(100);
    } catch (err) {
      await job.log(`${err}`);
      throw err;
    }
  },
  {
    connection: {
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
    },
    concurrency: 1,
  },
);

export const fixOutOfSyncChaptersQueue = new Queue('fixOutOfSyncChaptersQueue', {
  connection: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
  },
  defaultJobOptions: {
    removeOnComplete: true,
  },
});
