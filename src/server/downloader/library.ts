import chokidar from 'chokidar';
import fs from 'fs/promises';
import { diffString } from 'json-diff';
import path from 'path';
import { readConfig, updateConfig } from './config';
import { logger } from './logging';
import { scheduleDownload } from './scheduler';
import { IFlags } from './utils';

export const watchLibrary = async (flags: IFlags) => {
  const ymlPath = path.resolve(process.cwd(), path.relative(process.cwd(), flags.config));
  let config = await readConfig(ymlPath);

  await fs.mkdir(config.collection.path, { recursive: true });
  let library = Object.keys(config.collection.titles);
  await Promise.all(
    library.map(async (dir) => {
      const title = config.collection.titles[dir];
      if (title) {
        scheduleDownload(title, config);
      }
    }),
  );

  chokidar.watch(ymlPath, { persistent: false }).on('change', async () => {
    const newConfig = await readConfig(ymlPath);
    const diff = diffString(config, newConfig);
    config = newConfig;
    if (diff) {
      await updateConfig(flags);
      library = Object.keys(config.collection.titles);
      await Promise.all(
        library.map(async (dir) => {
          const title = config.collection.titles[dir];
          if (title) {
            scheduleDownload(title, config);
          }
        }),
      );
    }

    logger.debug(diff || 'No diff');
  });
};
