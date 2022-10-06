import fs from 'fs/promises';
import { diffString } from 'json-diff';
import path from 'path';
import { parse, stringify } from 'yaml';
import { logger } from '../../utils/logging';
import { IFlags } from './utils';

export interface IComic {
  name: string;
  download?: {
    checkForUpdate: 'daily' | 'hourly' | 'never' | 'weekly' | 'minutely';
    source: string;
    query: string;
    index: number;
  };
  metadata?: {
    write: boolean;
    match: {
      anilist?: string;
      kitsu?: string;
      myanimelist?: string;
      komga?: string;
    };
  };
  synonyms: string[];
}

interface ICollection {
  path: string;
  titles: {
    [key: string]: IComic;
  };
}

export interface IConfig {
  collection: ICollection;
}

export const getDefaultConfig = (): IConfig => ({
  collection: {
    path: '',
    titles: {},
  },
});

export const readConfig = async (configPath: string): Promise<IConfig> => {
  const ymlPath = path.resolve(process.cwd(), path.relative(process.cwd(), configPath));
  try {
    const configFile = await fs.readFile(ymlPath, 'utf-8');
    if (configFile.trim().length === 0) {
      logger.error(`Config file at ${ymlPath} is empty`);
      return getDefaultConfig();
    }
    return parse(configFile);
  } catch (err) {
    logger.error(`Failed to parse file ${ymlPath}. err: ${err}`);
    return getDefaultConfig();
  }
};

const getIndex = async (libraryPath: string, title: string): Promise<number> => {
  const titlePath = path.resolve(libraryPath, title);
  await fs.mkdir(titlePath, { recursive: true });
  const titleFiles = await fs.readdir(titlePath);

  const chapters = titleFiles
    .filter((chapter) => chapter.endsWith('cbz'))
    .sort()
    .reverse();

  if (chapters.length === 0 || !chapters[0]) {
    return 1;
  }
  const indexRegexp = /.*?\[(\d+)\].*/;
  const match = indexRegexp.exec(chapters[0]);
  if (!match || match.length < 2 || !match[1]) {
    return 1;
  }
  return parseInt(match[1], 10);
};

export const updateConfig = async (flags: IFlags) => {
  const configPath = path.resolve(process.cwd(), path.relative(process.cwd(), flags.config));
  let configFile;
  try {
    configFile = await fs.open(configPath, 'r+');
  } catch (err) {
    logger.error(`Cannot open the config at ${configPath}. err: ${err}`);
    process.exit(1);
  }

  const configFileContent = await configFile.readFile('utf-8');
  if (configFileContent.trim().length === 0) {
    logger.error(`Config file at "${configPath}" is empty`);
    await configFile.close();
    process.exit(1);
  }

  let config: IConfig;
  try {
    config = parse(configFileContent);
  } catch (err) {
    logger.error(`Failed to parse config file at ${configPath}`);
    await configFile.close();
    process.exit(1);
  }

  await fs.mkdir(config.collection.path, { recursive: true });
  const library = [
    ...new Set([...(await fs.readdir(config.collection.path)), ...(Object.keys(config.collection.titles) || [])]),
  ];

  const titles = await Promise.all(
    library.map(async (title) => {
      const sanitizedTitle = title.replaceAll('_', ' ');
      const download = config.collection.titles[title]?.download;
      const synonyms = config.collection.titles[title]?.synonyms;
      return {
        name: title,
        download: {
          index: await getIndex(config.collection.path, title),
          checkForUpdate: download?.checkForUpdate || 'hourly',
          query: download?.query || sanitizedTitle,
          source: download?.source || '',
        },
        synonyms: synonyms || [sanitizedTitle],
      };
    }),
  );

  const newTitles = titles.sort().reduce((acc, current) => {
    return {
      ...acc,
      [current.name]: { name: current.name, download: current.download, synonyms: current.synonyms },
    };
  }, {});

  const diff = diffString(config.collection.titles, newTitles);
  logger.debug(diff || 'No diff');

  if (diff) {
    config.collection.titles = newTitles;
    await configFile.write(stringify(config), 0);

    logger.info(`Successfully updated config at "${configPath}" for the library "${config.collection.path}"`);
  }
  await configFile.close();
};

export const generateConfig = async (flags: IFlags) => {
  const configPath = path.resolve(process.cwd(), path.relative(process.cwd(), flags.config));
  const libraryPath = path.resolve(process.cwd(), path.relative(process.cwd(), flags.library));
  const configFile = await fs.open(configPath, 'a+');
  await fs.mkdir(libraryPath, { recursive: true });
  const configFileContent = await configFile.readFile('utf-8');
  if (configFileContent.trim().length > 0) {
    logger.error(`Config file already exists at "${configPath}"`);
    await configFile.close();
    process.exit(1);
  }

  const config: IConfig = getDefaultConfig();
  config.collection.path = libraryPath;

  const library = await fs.readdir(libraryPath);

  const titles = await Promise.all(
    library.map(async (title) => {
      const sanitizedTitle = title.replaceAll('_', ' ');
      logger.info(`Setting up config for "${sanitizedTitle}"`);

      return {
        name: title,
        download: {
          index: await getIndex(libraryPath, title),
          checkForUpdate: 'hourly',
          query: sanitizedTitle,
          source: '',
        },
        synonyms: [sanitizedTitle],
      };
    }),
  );

  config.collection.titles = titles.reduce((acc, current) => {
    return {
      ...acc,
      [current.name]: { name: current.name, download: current.download, synonyms: current.synonyms },
    };
  }, {});

  await configFile.write(stringify(config), 0);
  await configFile.close();

  logger.info(`Successfully generated config at "${configPath}" for the library "${libraryPath}"`);
};
