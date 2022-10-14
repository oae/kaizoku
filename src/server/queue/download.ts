import { Job, Queue, Worker } from 'bullmq';
import { downloadChapter } from '../utils/mangal';
import { sendNotification } from '../utils/notification';

interface IDownloadWorkerData {
  chapterIndex: number;
  source: string;
  query: string;
  title: string;
  libraryPath: string;
}

export const downloadWorker = new Worker(
  'downloadQueue',
  async (job: Job) => {
    const { chapterIndex, libraryPath, title, source }: IDownloadWorkerData = job.data;
    try {
      downloadChapter(title, source, chapterIndex, libraryPath);
    } catch (err) {
      await job.log(`${err}`);
      throw err;
    }
    await sendNotification(`Downloaded a new chapter #${chapterIndex + 1} for ${title} from ${source}`);
    await job.updateProgress(100);
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
