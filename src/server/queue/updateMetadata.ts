import { Job, Queue, Worker } from 'bullmq';
import { refreshMetadata } from '../utils/integration';

import { getMangaPath, updateExistingMangaMetadata } from '../utils/mangal';

export interface IUpdateMetadataWorkerData {
  libraryPath: string;
  mangaTitle: string;
}

export const updateMetadataWorker = new Worker(
  'updateMetadataQueue',
  async (job: Job) => {
    const { libraryPath, mangaTitle }: IUpdateMetadataWorkerData = job.data;
    try {
      await updateExistingMangaMetadata(libraryPath, mangaTitle);
      await refreshMetadata(mangaTitle);
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
    concurrency: 5,
  },
);

export const updateMetadataQueue = new Queue('updateMetadataQueue', {
  connection: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    username: parseString(process.env.REDIS_USER || null),
    password: parseString(process.env.REDIS_PASS || null),
  },
  defaultJobOptions: {
    removeOnComplete: true,
    attempts: 10,
    backoff: {
      type: 'fixed',
      delay: 1000 * 60 * 2,
    },
  },
});

export const scheduleUpdateMetadata = async (libraryPath: string, mangaTitle: string) => {
  await updateMetadataQueue.add(getMangaPath(libraryPath, mangaTitle), {
    libraryPath,
    mangaTitle,
  });
};
