import execa from 'execa';
import { logger } from './logging';

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

export const search = async (source: string, query: string): Promise<IOutput> => {
  try {
    const { stdout, command } = await execa('mangal', ['inline', '--source', source, '--query', query, '-j']);
    logger.info(`Search manga with following command: ${command}`);
    return JSON.parse(stdout);
  } catch (err) {
    logger.error(`Failed to get available sources: err: ${err}`);
  }

  return {
    Manga: [],
  };
};

export const getChapters = async (source: string, query: string, order: string): Promise<number[]> => {
  try {
    const { stdout, command } = await execa('mangal', [
      'inline',
      '--source',
      source,
      '--query',
      query,
      '--manga',
      order,
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

export const getMangaDetail = async (source: string, query: string, order: string) => {
  try {
    const { stdout, command } = await execa('mangal', [
      'inline',
      '--source',
      source,
      '--query',
      query,
      '--manga',
      order,
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

export const downloadChapter = async (
  title: string,
  source: string,
  query: string,
  chapterIndex: number,
  order: string,
  libraryPath: string,
) => {
  try {
    logger.info(`Downloading chapter #${chapterIndex} for ${title} from ${source}`);
    const { stdout, stderr, command } = await execa(
      'mangal',
      ['inline', '--source', source, '--query', query, '--manga', order, '--chapters', `${chapterIndex}`, '-d'],
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
