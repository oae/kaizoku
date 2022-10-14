import execa from 'execa';
import fs from 'fs/promises';
import { logger } from '../../utils/logging';

export interface IOutput {
  Manga: Manga[];
}

export interface Manga {
  Name: string;
  URL: string;
  Index: number;
  ID: string;
  Chapters: Chapter[];
  Metadata: Metadata;
}

export interface Chapter {
  Name: string;
  URL: string;
  Index: number;
  ID: string;
  Volume: string;
}

export interface Metadata {
  Genres: string[];
  Summary: string;
  Author: string;
  Cover: string;
  Tags: string[];
  Characters: string[];
  Status: string;
  StartDate: MangaDate;
  EndDate: MangaDate;
  Synonyms: string[];
  URLs: string[];
}

export interface MangaDate {
  Year: number;
  Month: number;
  Day: number;
}

export const getAvailableSources = async () => {
  try {
    const { stdout, command } = await execa('mangal', ['sources', '-r']);
    logger.info(`Get available sources with following command: ${command}`);
    return stdout.split('\n').map((s) => s.trim());
  } catch (err) {
    logger.error(`Failed to get available sources: err: ${err}`);
  }

  return [];
};

export const search = async (source: string, keyword: string): Promise<IOutput> => {
  try {
    const { stdout, command } = await execa('mangal', ['inline', '--source', source, '--query', keyword, '-j']);
    logger.info(`Search manga with following command: ${command}`);
    return JSON.parse(stdout);
  } catch (err) {
    logger.error(`Failed to get available sources: err: ${err}`);
  }

  return {
    Manga: [],
  };
};

export const getChapters = async (source: string, title: string): Promise<number[]> => {
  try {
    const { stdout, command } = await execa('mangal', [
      'inline',
      '--source',
      source,
      '--query',
      title,
      '--manga',
      'first',
      '--chapters',
      'all',
      '-j',
    ]);
    logger.info(`Get chapters with following command: ${command}`);
    const result: IOutput = JSON.parse(stdout);
    if (result && result.Manga.length === 1 && result.Manga[0]?.Chapters && result.Manga[0]?.Chapters.length > 0) {
      return result.Manga[0].Chapters.map((c) => c.Index);
    }
  } catch (err) {
    logger.error(err);
  }

  return [];
};

export const getMangaDetail = async (source: string, title: string) => {
  try {
    const { stdout, command } = await execa('mangal', [
      'inline',
      '--source',
      source,
      '--query',
      title,
      '--manga',
      'first',
      '-j',
    ]);
    logger.info(`Get manga detail with following command: ${command}`);
    const result: IOutput = JSON.parse(stdout);
    if (result && result.Manga.length === 1) {
      return result.Manga[0];
    }
  } catch (err) {
    logger.error(err);
  }

  return undefined;
};

export const downloadChapter = async (title: string, source: string, chapterIndex: number, libraryPath: string) => {
  try {
    logger.info(`Downloading chapter #${chapterIndex} for ${title} from ${source}`);
    const { stdout, stderr, command } = await execa(
      'mangal',
      ['inline', '--source', source, '--query', title, '--manga', 'first', '--chapters', `${chapterIndex}`, '-d'],
      {
        cwd: libraryPath,
      },
    );

    logger.info(`Download chapter with following command: ${command}`);

    if (stderr) {
      logger.error(`Failed to download the chapter #${chapterIndex} for ${title}. Err:\n${stderr}`);
      throw new Error(stderr);
    } else {
      logger.info(`Downloaded chapter #${chapterIndex} for ${title}. Result:\n${stdout}`);
    }
  } catch (err) {
    logger.error(`Failed to download the chapter #${chapterIndex} for ${title}. Err:\n${err}`);
    throw err;
  }
};

export const findMissingChapters = async (mangaDir: string, source: string, title: string) => {
  const sources = await getAvailableSources();
  if (sources.indexOf(source) < 0) {
    logger.error(`Specified source: ${source} is not installed.`);
    throw new Error();
  }
  await fs.mkdir(mangaDir, { recursive: true });
  const titleFiles = await fs.readdir(mangaDir);

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

  const remoteChapters = await getChapters(source, title);
  return remoteChapters.filter((c) => !localChapters.includes(c));
};

export const createLibrary = async (libraryPath: string) => {
  await fs.mkdir(libraryPath, { recursive: true });
};

export const removeManga = async (mangaDir: string) => {
  await fs.rm(mangaDir, { recursive: true, force: true });
};
