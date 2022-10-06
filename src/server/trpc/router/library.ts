import { z } from 'zod';
import { logger } from '../../../utils/logging';
import { t } from '../trpc';

export const libraryRouter = t.router({
  query: t.procedure.query(async ({ ctx }) => {
    return ctx.prisma.library.findFirst();
  }),
  create: t.procedure
    .input(
      z.object({
        path: z.string().trim().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      logger.info(`input: ${JSON.stringify(input, null, 2)}`);
      const library = await ctx.prisma.library.create({
        data: {
          path: input.path,
        },
      });
      return library;
    }),
});
