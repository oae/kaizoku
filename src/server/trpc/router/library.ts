import path from 'path';
import { z } from 'zod';
import { createLibrary } from '../../utils/mangal';
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
      const libraryPath = path.resolve(process.cwd(), path.relative(process.cwd(), input.path));
      const library = await ctx.prisma.library.create({
        data: {
          path: libraryPath,
        },
      });
      await createLibrary(libraryPath);
      return library;
    }),
});
