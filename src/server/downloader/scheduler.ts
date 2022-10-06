import { Job, Worker } from 'bullmq';
import { IComic, IConfig } from './config';
import { findMissingChapters } from './downloader';
import { logger } from '../../utils/logging';
import { checkChaptersQue, downloadQue } from './queue';

const CRON_MAP = {
  daily: '0 0 * * *',
  hourly: '0 * * * *',
  minutely: '* * * * *',
  weekly: '0 * * * 7',
};

const checkChapters = async (title: IComic, libraryPath: string) => {
  logger.info(`Checking for new chapters: ${title.name}`);
  const missingChapters = await findMissingChapters(title, libraryPath);

  if (missingChapters.length === 0) {
    logger.info(`There are no missing chapters for ${title.name}`);
  } else {
    logger.info(`There are ${missingChapters.length} new chapters for ${title.name}`);
  }

  await Promise.all(
    missingChapters.map(async (chapterIndex) => {
      const job = await downloadQue.getJob(`${title.name}_${chapterIndex - 1}_download`);
      if (job) {
        await job.remove();
      }
    }),
  );

  await downloadQue.addBulk(
    missingChapters.map((chapterIndex) => ({
      opts: {
        jobId: `${title.name}_${chapterIndex - 1}_download`,
      },
      name: `${title.name}_${chapterIndex - 1}_download`,
      data: {
        chapterIndex: chapterIndex - 1,
        source: title.download?.source,
        query: title.download?.query,
        name: title.name,
        libraryPath,
      },
    })),
  );
};

export const scheduleDownload = async (title: IComic, config: IConfig) => {
  if (!title.download || title.download.checkForUpdate === 'never') {
    return;
  }
  const jobs = await checkChaptersQue.getJobs('delayed');
  await Promise.all(
    jobs.map(async (job) => {
      if (job.id) {
        return checkChaptersQue.remove(job.id);
      }
      return null;
    }),
  );
  await checkChaptersQue.add(
    `check_${title.name}_chapters`,
    {
      title,
      libraryPath: config.collection.path,
    },
    {
      jobId: `check_${title.name}_chapters`,
      repeatJobKey: `check_${title.name}_chapters`,
      repeat: {
        pattern: CRON_MAP[title.download.checkForUpdate],
      },
    },
  );

  await checkChapters(title, config.collection.path);
};

interface ICheckChaptersWorker {
  title: IComic;
  libraryPath: string;
}

export const checkChaptersWorker = new Worker(
  'checkChaptersQue',
  async (job: Job) => {
    const { title, libraryPath }: ICheckChaptersWorker = job.data;
    await checkChapters(title, libraryPath);
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
