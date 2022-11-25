import { createBullBoard } from '@bull-board/api';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { ExpressAdapter } from '@bull-board/express';
import express, { Request, Response } from 'express';
import next from 'next';
import { logger } from '../utils/logging';
import { checkChaptersQueue, scheduleAll } from './queue/checkChapters';
import { downloadQueue } from './queue/download';
import { integrationQueue } from './queue/integration';
import { notificationQueue } from './queue/notify';
import { updateMetadataQueue } from './queue/updateMetadata';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/bull/queues');

createBullBoard({
  queues: [
    new BullAdapter(downloadQueue),
    new BullAdapter(checkChaptersQueue),
    new BullAdapter(notificationQueue),
    new BullAdapter(updateMetadataQueue),
    new BullAdapter(integrationQueue),
  ],
  serverAdapter,
});

(async () => {
  try {
    await app.prepare();
    const port = process.env.KAIZOKU_PORT || 3000;
    await scheduleAll();
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
