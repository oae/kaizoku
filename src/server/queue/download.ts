import { PrismaClient } from '@prisma/client';
import { Job, Queue, Worker } from 'bullmq';
import { downloadChapter, getChapterFromLocal } from '../utils/mangal';
import { sendNotification } from '../utils/notification';
import type { MangaWithLibrary } from './checkChapters';

interface IDownloadWorkerData {
  manga: MangaWithLibrary;
  chapterIndex: number;
}

const prisma = new PrismaClient();

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

      await prisma.chapter.create({
        data: {
          ...chapter,
          mangaId: manga.id,
        },
      });
      await sendNotification(`Downloaded a new chapter #${chapterIndex + 1} for ${manga.title} from ${manga.source}`);
      await job.updateProgress(100);
    } catch (err) {
      await job.log(`${err}`);
      throw err;
    }
  },
  {
    concurrency: 5,
    connection: {
      host: 'localhost',
      port: 6379,
    },
  },
);

export const downloadQueue = new Queue('downloadQueue', {
  connection: {
    host: 'localhost',
    port: 6379,
  },
  defaultJobOptions: {
    attempts: 20,
    backoff: {
      type: 'fixed',
      delay: 1000 * 60 * 2,
    },
  },
});
