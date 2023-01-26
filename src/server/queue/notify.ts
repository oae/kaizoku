import { Job, Queue, Worker } from 'bullmq';
import { sendNotification } from '../utils/notification';

export interface INotificationWorkerData {
  chapterIndex: number;
  chapterFileName: string;
  mangaTitle: string;
  source: string;
  url?: string;
}

export const notificationWorker = new Worker(
  'notificationQueue',
  async (job: Job) => {
    const { chapterIndex, chapterFileName, mangaTitle, source, url }: INotificationWorkerData = job.data;
    try {
      await sendNotification(
        'Chapter grabbed',
        `Chapter #${chapterIndex + 1} downloaded as ${chapterFileName} for ${mangaTitle} from ${source}`,
        url,
      );
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
    concurrency: 30,
    limiter: {
      max: 30,
      duration: 1000 * 2,
    },
  },
);

export const notificationQueue = new Queue('notificationQueue', {
  connection: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
  },
  defaultJobOptions: {
    removeOnComplete: true,
    attempts: 20,
    backoff: {
      type: 'fixed',
      delay: 1000 * 60 * 2,
    },
  },
});
