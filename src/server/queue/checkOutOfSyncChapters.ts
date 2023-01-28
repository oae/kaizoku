import { OutOfSyncChapter } from '@prisma/client';
import { Job, Queue, Worker } from 'bullmq';
import path from 'path';
import { sanitizer } from '../../utils';
import { prisma } from '../db/client';
import { getOutOfSyncChapters } from '../utils/mangal';
import { syncDbWithFiles } from './checkChapters';

export interface ICheckOutOfSyncChaptersWorkerData {
  mangaId: number;
}

export const checkOutOfSyncChaptersWorker = new Worker(
  'checkOutOfSyncChaptersQueue',
  async (job: Job) => {
    const { mangaId }: ICheckOutOfSyncChaptersWorkerData = job.data;
    try {
      const mangaInDb = await prisma.manga.findUniqueOrThrow({
        include: { library: true, chapters: true, metadata: true },
        where: { id: mangaId },
      });
      await syncDbWithFiles(mangaInDb);
      const mangaDir = path.resolve(mangaInDb.library.path, sanitizer(mangaInDb.title));
      const toBeRemovedChapters = await getOutOfSyncChapters(mangaDir, mangaInDb.source, mangaInDb.title);

      await prisma.outOfSyncChapter.deleteMany({ where: { mangaId: mangaInDb.id } });
      await prisma.outOfSyncChapter.createMany({
        data: toBeRemovedChapters
          .map((outOfSyncChapterFile) => {
            const chapter = mangaInDb.chapters.find((c) => c.fileName === outOfSyncChapterFile.fileName);
            if (!chapter) {
              return undefined;
            }

            return {
              id: chapter.id,
              mangaId: mangaInDb.id,
            };
          })
          .filter((c) => c) as OutOfSyncChapter[],
      });
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

export const checkOutOfSyncChaptersQueue = new Queue('checkOutOfSyncChaptersQueue', {
  connection: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
  },
  defaultJobOptions: {
    removeOnComplete: true,
  },
});
