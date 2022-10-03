import { createBullBoard } from '@bull-board/api';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { checkChaptersQue, downloadQue } from './queue';

export const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/admin/queues');

createBullBoard({
  queues: [new BullAdapter(downloadQue), new BullAdapter(checkChaptersQue)],
  serverAdapter,
});
