import { z } from 'zod';
import { t } from '../trpc';

export const mangaRouter = t.router({
  create: t.procedure
    .input(
      z.object({
        library: z.number(),
      }),
    )
    .mutation(({ input }) => {
      return input;
    }),
});
