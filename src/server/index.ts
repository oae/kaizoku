import { createBullBoard } from '@bull-board/api';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { ExpressAdapter } from '@bull-board/express';
import express, { Request, Response } from 'express';
import next from 'next';
import { logger } from '../utils/logging';
import { checkChaptersQueue } from './queue/checkChapters';
import { downloadQueue } from './queue/download';
import { notificationQueue } from './queue/notify';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();
const port = process.env.APP_PORT || 3000;

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/bull/queues');

createBullBoard({
  queues: [new BullAdapter(downloadQueue), new BullAdapter(checkChaptersQueue), new BullAdapter(notificationQueue)],
  serverAdapter,
});

(async () => {
  try {
    await app.prepare();
    const server = express();
    server.use('/bull/queues', serverAdapter.getRouter()).all('*', (req: Request, res: Response) => {
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
