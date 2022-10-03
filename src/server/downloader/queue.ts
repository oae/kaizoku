import { Queue } from 'bullmq';

// Create a new connection in every instance
export const downloadQue = new Queue('downloadQue', {
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

export const checkChaptersQue = new Queue('checkChaptersQue', {
  connection: {
    host: 'localhost',
    port: 6379,
  },
});
