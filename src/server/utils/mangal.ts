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
    const { stdout, escapedCommand } = await execa('mangal', ['sources', 'list', '-r']);
    logger.info(`Get available sources with following command: ${escapedCommand}`);
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
  'downloader.stop_on_error',
  'metadata.comic_info_xml',
  'metadata.fetch_anilist',
  'metadata.series_json',
  'formats.use',
];

export const getMangalConfig = async (): Promise<MangalConfig[]> => {
  try {
    const { stdout, escapedCommand } = await execa('mangal', ['config', 'info', '-j']);
    logger.info(`Getting mangal config with following command: ${escapedCommand}`);
    const result = JSON.parse(stdout) as MangalConfig[];

    return result.filter((item) => !excludedConfigs.includes(item.key) && item.type !== '[]string');
  } catch (err) {
    logger.error(`Failed to get mangal config. err: ${err}`);
  }

  return [];
};

export const setMangalConfig = async (key: string, value: string | boolean | number | string[]) => {
  try {
    const { escapedCommand } = await execa('mangal', ['config', 'set', '--key', key, '--value', `${value}`]);
    logger.info(`set mangal config with following command: ${escapedCommand}`);
  } catch (err) {
    logger.error(`Failed to set mangal config. err: ${err}`);
  }
};

export const bindTitleToAnilistId = async (title: string, anilistId: string) => {
  try {
    const { escapedCommand } = await execa('mangal', ['inline', 'anilist', 'set', '--name', title, '--id', anilistId]);
    logger.info(`Bind manga to anilist id with following command: ${escapedCommand}`);
  } catch (err) {
    logger.error(`Failed to bind manga to anilist id. err: ${err}`);
  }
};

export const updateExistingMangaMetadata = async (libraryPath: string, title: string) => {
  try {
    const { escapedCommand } = await execa('mangal', [
      'inline',
      'anilist',
      'update',
      '--path',
      getMangaPath(libraryPath, title),
    ]);
    logger.info(`Updated existing manga metadata: ${escapedCommand}`);
  } catch (err) {
    logger.error(`Failed to update existing manga metadata. err: ${err}`);
  }
};

export const search = async (source: string, keyword: string): Promise<IOutput> => {
  try {
    const { stdout, escapedCommand } = await execa('mangal', [
      'inline',
      '--source',
      source,
      '--include-anilist-manga',
      '--query',
      keyword,
      '-j',
    ]);
    logger.info(`Search manga with following command: ${escapedCommand}`);
    return JSON.parse(stdout);
  } catch (err) {
    logger.error(`Failed to search manga. err: ${err}`);
  }

  return {
    result: [],
  };
};

export const getChaptersFromRemote = async (source: string, title: string): Promise<Chapter[]> => {
  try {
    const { stdout, escapedCommand } = await execa('mangal', [
      'inline',
      '--source',
      source,
      '--query',
      title,
      '--manga',
      'exact',
      '--chapters',
      'all',
      '-j',
    ]);
    logger.info(`Get chapters with following command: ${escapedCommand}`);
    const output: IOutput = JSON.parse(stdout);
    if (
      output &&
      output.result.length === 1 &&
      output.result[0]?.mangal.chapters &&
      output.result[0]?.mangal.chapters.length > 0
    ) {
      return output.result[0].mangal.chapters.map((c) => ({ ...c, index: c.index - 1 }));
    }
  } catch (err) {
    logger.error(err);
  }

  return [];
};

export const getMangaMetadata = async (source: string, title: string): Promise<Metadata | undefined> => {
  try {
    const { stdout, escapedCommand } = await execa('mangal', [
      'inline',
      '--source',
      source,
      '--include-anilist-manga',
      '--query',
      title,
      '--manga',
      'exact',
      '-j',
    ]);
    logger.info(`Get manga metadata with following command: ${escapedCommand}`);
    const output: IOutput = JSON.parse(stdout);
    if (output && output.result.length === 1) {
      return output.result[0].mangal?.metadata;
    }
  } catch (err) {
    logger.error(err);
  }

  return undefined;
};

export const getMangaDetail = async (source: string, title: string): Promise<Mangal | undefined> => {
  try {
    const { stdout, escapedCommand } = await execa('mangal', [
      'inline',
      '--source',
      source,
      '--include-anilist-manga',
      '--query',
      title,
      '--manga',
      'exact',
      '--chapters',
      'all',
      '-j',
    ]);
    logger.info(`Get manga detail with following command: ${escapedCommand}`);
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
    const { stdout, stderr, escapedCommand } = await execa(
      'mangal',
      ['inline', '--source', source, '--query', title, '--manga', 'exact', '--chapters', `${chapterIndex}`, '-d'],
      {
        cwd: libraryPath,
      },
    );

    logger.info(`Download chapter with following command: ${escapedCommand}`);

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

export interface ChapterMangal {
  name: string;
  url: string;
  index: number;
  id: number;
  volume: number;
  pages: null | number;
}
export const getChapter = async (
  title: string,
  source: string,
  chapterIndex: number,
  libraryPath: string,
): Promise<ChapterMangal> => {
  try {
    logger.info(`Get chapter #${chapterIndex} for ${title} from ${source}`);
    const { stdout, stderr, escapedCommand } = await execa(
      'mangal',
      ['inline', '--source', source, '--query', title, '--manga', 'exact', '--chapters', `${chapterIndex}`, '-j'],
      {
        cwd: libraryPath,
      },
    );

    logger.info(`Get chapter with following command: ${escapedCommand}`);

    if (stderr) {
      logger.error(`Failed to get the chapter #${chapterIndex} for ${title}. Err:\n${stderr}`);
      throw new Error(stderr);
    } else {
      logger.info(`Get chapter #${chapterIndex} for ${title}. Result:\n${stdout}`);
    }
    const response = JSON.parse(stdout.trim());
    if (Array.isArray(response?.result) && response?.result.length > 0) {
      const chapters = response?.result[0].mangal.chapters;
      if (Array.isArray(chapters) && chapters.length > 0) {
        return response?.result[0].mangal.chapters[0];
      }
    }
    throw new Error('Failed to Get the chapter');
  } catch (err) {
    logger.error(`Failed to Get the chapter #${chapterIndex} for ${title}. Err:\n${err}`);
    throw err;
  }
};

export const getChapterIndexFromFile = (chapterFile: string) => {
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
  try {
    const stat = await fs.stat(chapterFile);
    let createdAt = new Date();

    if (stat.birthtime.getTime() !== 0) {
      createdAt = stat.birthtime;
    } else if (stat.ctime.getTime() !== 0) {
      createdAt = stat.ctime;
    } else if (stat.mtime.getTime() !== 0) {
      createdAt = stat.mtime;
    }

    return {
      index: getChapterIndexFromFile(chapterFile)!,
      size: stat.size,
      createdAt,
      fileName: path.basename(chapterFile),
    };
  } catch (err) {
    logger.error(`Error occurred while getting stat from ${chapterFile}: ${err}`);
    throw err;
  }
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

  const localChapters = (await fs.readdir(mangaDir)).filter(shouldIncludeFile);
  const localChapterIndexList = localChapters.map(getChapterIndexFromFile);

  const remoteChapters = await getChaptersFromRemote(source, title);
  const remoteChapterIndexList = remoteChapters.map((r) => r.index);

  return remoteChapterIndexList.filter((c) => !localChapterIndexList.includes(c));
};

export const createLibrary = async (libraryPath: string) => {
  await fs.mkdir(libraryPath, { recursive: true });
};

export const removeManga = async (mangaDir: string) => {
  await fs.rm(mangaDir, { recursive: true, force: true });
};

export const removeChapter = async (mangaDir: string, chapterFileName: string) => {
  await fs.rm(path.join(mangaDir, chapterFileName), { force: true });
};

export const clearCache = async () => {
  try {
    const { stdout, escapedCommand } = await execa('mangal', ['where', '--cache']);
    logger.info(`Getting mangal cache path with following command: ${escapedCommand}`);
    const cachedFiles = await fs.readdir(stdout);
    await Promise.all(
      cachedFiles
        .filter((cachedFile) => cachedFile.endsWith('json') && cachedFile.indexOf('anilist') < 0)
        .map(async (cachedJson) => fs.rm(path.join(stdout, cachedJson), { force: true })),
    );
  } catch (err) {
    logger.error(`Failed to remove mangal cache. err: ${err}`);
  }
};

export const getOutOfSyncChapters = async (mangaDir: string, source: string, title: string) => {
  const localChapters = await getChaptersFromLocal(mangaDir);
  const remoteChapters = await getChaptersFromRemote(source, title);
  if (remoteChapters.length === 0) {
    logger.info('Source may not be available. I will not mark any chapter for removal.');
    return [];
  }
  const remoteChaptersWithIndex = remoteChapters.map((r) => ({
    fileName: `[${String(r.index + 1).padStart(4, '0')}]_${sanitizer(r.name)}.cbz`,
    index: r.index + 1,
  }));

  return localChapters.filter(
    (l) => !remoteChaptersWithIndex.find((r) => l.index + 1 === r.index && l.fileName === r.fileName),
  );
};
