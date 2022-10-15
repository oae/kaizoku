import execa from 'execa';
import fs from 'fs/promises';
import path from 'path';
import { logger } from '../../utils/logging';
import { sanitizer } from '../../utils/sanitize';

interface IOutput {
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

interface Chapter {
  Name: string;
  URL: string;
  Index: number;
  ID: string;
  Volume: string;
}

interface Metadata {
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

interface MangaDate {
  Year: number;
  Month: number;
  Day: number;
}

interface ChapterFile {
  index: number;
  size: number;
  fileName: string;
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

export const getMangaPath = (libraryPath: string, title: string) => path.resolve(libraryPath, sanitizer(title));

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

export const getChaptersFromRemote = async (source: string, title: string): Promise<number[]> => {
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
      return result.Manga[0].Chapters.map((c) => c.Index - 1);
    }
  } catch (err) {
    logger.error(err);
  }

  return [];
};

export const getMangaDetail = async (source: string, title: string): Promise<Manga | undefined> => {
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

export const downloadChapter = async (
  title: string,
  source: string,
  chapterIndex: number,
  libraryPath: string,
): Promise<string> => {
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
    return stdout.trim();
  } catch (err) {
    logger.error(`Failed to download the chapter #${chapterIndex} for ${title}. Err:\n${err}`);
    throw err;
  }
};

const getChapterIndexFromFile = (chapterFile: string) => {
  const indexRegexp = /.*?\[(\d+)\].*/;
  const match = indexRegexp.exec(path.basename(chapterFile));
  if (!match || match.length < 2 || !match[1]) {
    return undefined;
  }
  return parseInt(match[1], 10) - 1;
};

const shouldIncludeFile = (chapterFile: string) => {
  return path.extname(chapterFile) === '.cbz' && getChapterIndexFromFile(chapterFile) !== undefined;
};

export const getChapterFromLocal = async (chapterFile: string) => {
  const stat = await fs.stat(chapterFile);
  return {
    index: getChapterIndexFromFile(chapterFile)!,
    size: stat.size,
    fileName: path.basename(chapterFile),
  };
};

export const getChaptersFromLocal = async (mangaDir: string): Promise<ChapterFile[]> => {
  await fs.mkdir(mangaDir, { recursive: true });
  const chapters = await fs.readdir(mangaDir);

  return Promise.all(
    chapters.filter(shouldIncludeFile).map((chapter) => getChapterFromLocal(path.resolve(mangaDir, chapter))),
  );
};

export const findMissingChapterFiles = async (mangaDir: string, source: string, title: string) => {
  const sources = await getAvailableSources();
  if (sources.indexOf(source) < 0) {
    logger.error(`Specified source: ${source} is not installed.`);
    throw new Error();
  }
  await fs.mkdir(mangaDir, { recursive: true });
  const chapters = await fs.readdir(mangaDir);

  const localChapters = chapters.filter(shouldIncludeFile).map(getChapterIndexFromFile);

  const remoteChapters = await getChaptersFromRemote(source, title);
  return remoteChapters.filter((c) => !localChapters.includes(c));
};

export const createLibrary = async (libraryPath: string) => {
  await fs.mkdir(libraryPath, { recursive: true });
};

export const removeManga = async (mangaDir: string) => {
  await fs.rm(mangaDir, { recursive: true, force: true });
};
