import { Job, Worker } from 'bullmq';
import execa from 'execa';
import fs from 'fs/promises';
import path from 'path';
import { IComic } from './config';
import { logger } from './logging';
import { sendNotification } from './notification';

interface IChapterSearch {
  Manga: {
    Chapters: {
      Index: number;
    }[];
  }[];
}

interface IDownloadWorkerData {
  chapterIndex: number;
  source: string;
  query: string;
  name: string;
  libraryPath: string;
}

const getAvailableSources = async () => {
  const { stdout } = await execa('mangal', ['sources', '-r']);
  return stdout.split('\n').map((s) => s.trim());
};

const getRemoteChapters = async (source: string, query: string): Promise<number[]> => {
  try {
    const { stdout } = await execa('mangal', [
      'inline',
      '--source',
      source,
      '--query',
      query,
      '--manga',
      'first',
      '--chapters',
      'all',
      '-j',
    ]);
    const result: IChapterSearch = JSON.parse(stdout);
    if (result && result.Manga.length === 1 && result.Manga[0]?.Chapters && result.Manga[0]?.Chapters.length > 0) {
      return result.Manga[0].Chapters.map((c) => c.Index);
    }
  } catch (err) {
    logger.error(err);
  }

  return [];
};

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

  const remoteChapters = await getRemoteChapters(title.download?.source, title.download?.query);
  return remoteChapters.filter((c) => !localChapters.includes(c));
};

export const downloadWorker = new Worker(
  'downloadQue',
  async (job: Job) => {
    const { chapterIndex, libraryPath, name, query, source }: IDownloadWorkerData = job.data;
    try {
      logger.info(`Downloading chapter #${chapterIndex} for ${name} from ${source}`);
      const { stdout, stderr } = await execa(
        'mangal',
        ['inline', '--source', source, '--query', query, '--manga', 'first', '--chapters', `${chapterIndex}`, '-d'],
        {
          cwd: libraryPath,
        },
      );

      if (stderr) {
        logger.error(`Failed to download the chapter #${chapterIndex} for ${name}. Err:\n${stderr}`);
        await job.log(stderr);
        throw new Error(stderr);
      } else {
        logger.info(`Downloaded chapter #${chapterIndex} for ${name}. Result:\n${stdout}`);
      }
    } catch (err) {
      logger.error(`Failed to download the chapter #${chapterIndex} for ${name}. Err:\n${err}`);
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
