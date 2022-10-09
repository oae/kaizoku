import { Job, Worker } from 'bullmq';
import fs from 'fs/promises';
import path from 'path';
import { logger } from '../../utils/logging';
import { downloadChapter, getAvailableSources, getChapters } from '../../utils/mangal';
import { IComic } from './config';
import { sendNotification } from './notification';

interface IDownloadWorkerData {
  chapterIndex: number;
  source: string;
  query: string;
  name: string;
  libraryPath: string;
}

export const findMissingChapters = async (title: IComic, libraryPath: string) => {
  if (!title.download) {
    logger.error(`Download option is not configured for ${title.name}`);
    throw new Error();
  }
  if (!title.download.source) {
    logger.error(`Download source is not configured for ${title.name}`);
    throw new Error();
  }
  const sources = await getAvailableSources();
  if (sources.indexOf(title.download.source) < 0) {
    logger.error(`Specified source: ${title.download.source} for ${title.name} is not installed.`);
    throw new Error();
  }
  const titlePath = path.resolve(libraryPath, title.name);
  await fs.mkdir(titlePath, { recursive: true });
  const titleFiles = await fs.readdir(titlePath);

  const localChapters = titleFiles
    .filter((chapter) => chapter.endsWith('cbz'))
    .map((chapter) => {
      const indexRegexp = /.*?\[(\d+)\].*/;
      const match = indexRegexp.exec(chapter);
      if (!match || match.length < 2 || !match[1]) {
        return 1;
      }
      return parseInt(match[1], 10);
    })
    .filter((index) => index !== -1);

  const remoteChapters = await getChapters(title.download?.source, title.download?.query, 'first');
  return remoteChapters.filter((c) => !localChapters.includes(c));
};

export const downloadWorker = new Worker(
  'downloadQue',
  async (job: Job) => {
    const { chapterIndex, libraryPath, name, query, source }: IDownloadWorkerData = job.data;
    try {
      downloadChapter(name, source, query, chapterIndex, 'first', libraryPath);
    } catch (err) {
      await job.log(`${err}`);
      throw err;
    }
    await sendNotification(`Downloaded a new chapter #${chapterIndex + 1} for ${name} from ${source}`);
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
