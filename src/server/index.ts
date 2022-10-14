import express, { Request, Response } from 'express';
import next from 'next';
import { ExpressAdapter } from '@bull-board/express';
import { createBullBoard } from '@bull-board/api';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { logger } from '../utils/logging';
import { downloadQueue } from './queue/download';
import { checkChaptersQueue } from './queue/checkChapters';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();
const port = process.env.PORT || 3000;

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/admin/queues');

createBullBoard({
  queues: [new BullAdapter(downloadQueue), new BullAdapter(checkChaptersQueue)],
  serverAdapter,
});

(async () => {
  try {
    await app.prepare();
    const server = express();
    server.use('/admin/queues', serverAdapter.getRouter()).all('*', (req: Request, res: Response) => {
      return handle(req, res);
    });

    server.listen(port, () => {
      logger.info(`> Ready on http://localhost:${port} - env ${process.env.NODE_ENV}`);
    });
  } catch (e) {
    logger.error(e);
    process.exit(1);
  }
})();
