import { z } from 'zod';
import { t } from '../trpc';

export const mangaRouter = t.router({
  query: t.procedure
    .input(
      z.object({
        library: z.number(),
      }),
    )
    .query(async ({ input, ctx }) => {
      return ctx.prisma.manga.findMany({
        where: {
          libraryId: input.library,
        },
      });
    }),
});
