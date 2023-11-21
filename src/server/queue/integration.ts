import { Job, Queue, Worker } from 'bullmq';
import { scanLibrary } from '../utils/integration';

export const integrationWorker = new Worker(
  'integrationQueue',
  async (job: Job) => {
    try {
      await scanLibrary();
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
      username: parseString(process.env.REDIS_USER || null),
      password: parseString(process.env.REDIS_PASS || null),
    },
    concurrency: 30,
    limiter: {
      max: 30,
      duration: 1000 * 2,
    },
  },
);

export const integrationQueue = new Queue('integrationQueue', {
  connection: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    username: parseString(process.env.REDIS_USER || null),
    password: parseString(process.env.REDIS_PASS || null),
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
