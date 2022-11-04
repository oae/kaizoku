import execa from 'execa';
import fs from 'fs/promises';
import path from 'path';
import { logger } from '../../utils/logging';
import { sanitizer } from '../../utils';

interface IOutput {
  result: Result[];
}

interface Result {
  source: string;
  mangal: Mangal;
}

interface Mangal {
  name: string;
  url: string;
  index: number;
  id: string;
  chapters: Chapter[];
  metadata: Metadata;
}

interface Chapter {
  name: string;
  url: string;
  index: number;
  id: string;
  volume: string;
}

interface Metadata {
  genres: string[];
  summary: string;
  staff: Staff;
  cover: Cover;
  bannerImage: string;
  tags: string[];
  characters: string[];
  status: string;
  startDate: MangaDate;
  endDate: MangaDate;
  synonyms: string[];
  chapters: number;
  urls: string[];
}

interface Cover {
  extraLarge: string;
  large: string;
  medium: string;
  color: string;
}

interface MangaDate {
  year: number;
  month: number;
  day: number;
}

interface Staff {
  story: string[];
  art: string[];
  translation: string[];
  lettering: string[];
}

interface ChapterFile {
  index: number;
  size: number;
  fileName: string;
}

export const getMangaPath = (libraryPath: string, title: string) => path.resolve(libraryPath, sanitizer(title));

export const getAvailableSources = async () => {
  try {
    const { stdout, command } = await execa('mangal', ['sources', 'list', '-r']);
    logger.info(`Get available sources with following command: ${command}`);
    return stdout
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => !!s);
  } catch (err) {
    logger.error(`Failed to get available sources. err: ${err}`);
  }

  return [];
};

interface MangalConfig {
  key: string;
  value: string[] | boolean | number | string;
  default: string[] | boolean | number | string;
  description: string;
  type: MangalConfigType;
}

enum MangalConfigType {
  Bool = 'bool',
  Int = 'int',
  String = 'string',
  StringArray = '[]string',
}

const excludedConfigs = [
  'downloader.chapter_name_template',
  'downloader.redownload_existing',
  'downloader.download_cover',
  'downloader.create_manga_dir',
  'downloader.create_volume_dir',
  'downloader.default_sources',
  'downloader.path',
  'metadata.comic_info_xml',
  'metadata.fetch_anilist',
  'metadata.series_json',
  'formats.use',
];

export const getMangalConfig = async (): Promise<MangalConfig[]> => {
  try {
    const { stdout, command } = await execa('mangal', ['config', 'info', '-j']);
    logger.info(`Getting mangal config with following command: ${command}`);
    const result = JSON.parse(stdout) as MangalConfig[];

    return result.filter((item) => !excludedConfigs.includes(item.key) && item.type !== '[]string');
  } catch (err) {
    logger.error(`Failed to get mangal config. err: ${err}`);
  }

  return [];
};

export const setMangalConfig = async (key: string, value: string | boolean | number | string[]) => {
  try {
    const { command } = await execa('mangal', ['config', 'set', '--key', key, '--value', `${value}`]);
    logger.info(`set mangal config with following command: ${command}`);
  } catch (err) {
    logger.error(`Failed to set mangal config. err: ${err}`);
  }
};

export const bindTitleToAnilistId = async (title: string, anilistId: string) => {
  try {
    const { command } = await execa('mangal', ['inline', 'anilist', 'set', '--name', title, '--id', anilistId]);
    logger.info(`Bind manga to anilist id with following command: ${command}`);
  } catch (err) {
    logger.error(`Failed to bind manga to anilist id. err: ${err}`);
  }
};

export const updateExistingMangaMetadata = async (libraryPath: string, title: string) => {
  try {
    const { command } = await execa('mangal', [
      'inline',
      'anilist',
      'update',
      '--path',
      getMangaPath(libraryPath, title),
    ]);
    logger.info(`Updated existing manga metadata: ${command}`);
  } catch (err) {
    logger.error(`Failed to update existing manga metadata. err: ${err}`);
  }
};

export const search = async (source: string, keyword: string): Promise<IOutput> => {
  try {
    const { stdout, command } = await execa('mangal', [
      'inline',
      '--source',
      source,
      '--include-anilist-manga',
      '--query',
      keyword,
      '-j',
    ]);
    logger.info(`Search manga with following command: ${command}`);
    return JSON.parse(stdout);
  } catch (err) {
    logger.error(`Failed to search manga. err: ${err}`);
  }

  return {
    result: [],
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
    const output: IOutput = JSON.parse(stdout);
    if (
      output &&
      output.result.length === 1 &&
      output.result[0]?.mangal.chapters &&
      output.result[0]?.mangal.chapters.length > 0
    ) {
      return output.result[0].mangal.chapters.map((c) => c.index - 1);
    }
  } catch (err) {
    logger.error(err);
  }

  return [];
};

export const getMangaDetail = async (source: string, title: string): Promise<Mangal | undefined> => {
  try {
    const { stdout, command } = await execa('mangal', [
      'inline',
      '--source',
      source,
      '--include-anilist-manga',
      '--query',
      title,
      '--manga',
      'first',
      '--chapters',
      'all',
      '-j',
    ]);
    logger.info(`Get manga detail with following command: ${command}`);
    const output: IOutput = JSON.parse(stdout);
    if (output && output.result.length === 1) {
      return output.result[0].mangal;
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
    createdAt: stat.birthtime,
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
