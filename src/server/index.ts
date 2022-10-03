import express, { Request, Response } from 'express';
import next from 'next';
import { serverAdapter } from './downloader/bullboard';
import { watchLibrary } from './downloader/library';
import { logger } from './downloader/logging';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();
const port = process.env.PORT || 3000;

(async () => {
  try {
    await app.prepare();
    const server = express();
    server.use('/admin/queues', serverAdapter.getRouter()).all('*', (req: Request, res: Response) => {
      return handle(req, res);
    });

    await watchLibrary({
      config: 'manup.yml',
      generate: false,
      help: false,
      update: false,
      library: '',
      watch: true,
    });

    server.listen(port, () => {
      logger.info(`> Ready on localhost:${port} - env ${process.env.NODE_ENV}`);
    });
  } catch (e) {
    logger.error(e);
    process.exit(1);
  }
})();
