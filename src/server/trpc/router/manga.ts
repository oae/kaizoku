import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { getAvailableSources, getMangaDetail, search } from '../../../utils/mangal';
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
  sources: t.procedure.query(async () => {
    return getAvailableSources();
  }),
  detail: t.procedure
    .input(
      z.object({
        keyword: z.string().trim().min(1),
        source: z.string().trim().min(1),
        order: z.number().gte(0),
      }),
    )
    .query(async ({ input }) => {
      const { keyword, source, order } = input;
      return getMangaDetail(source, keyword, order.toString());
    }),
  search: t.procedure
    .input(
      z.object({
        keyword: z.string().trim().min(1),
        source: z.string().trim().min(1),
      }),
    )
    .query(async ({ input }) => {
      const { keyword, source } = input;
      const result = await search(source, keyword);
      return result.Manga.map((m, i) => ({
        status: m.Metadata.Status,
        title: m.Name,
        order: i,
        cover: m.Metadata.Cover,
      }));
    }),
  add: t.procedure
    .input(
      z.object({
        keyword: z.string().trim().min(1),
        source: z.string().trim().min(1),
        title: z.string().trim().min(1),
        interval: z.string().trim().min(1),
        order: z.number().gte(0),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { keyword, source, order, title, interval } = input;
      const detail = await getMangaDetail(source, keyword, order.toString());
      const library = await ctx.prisma.library.findFirst();
      if (!detail || !library) {
        return undefined;
      }
      const result = await ctx.prisma.manga.findFirst({
        where: {
          title,
        },
      });
      if (result) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: `${title} already exists in the library.`,
        });
      }

      return ctx.prisma.manga.create({
        data: {
          cover: detail.Metadata.Cover,
          query: keyword,
          source,
          title: detail.Name,
          libraryId: library?.id,
          interval,
        },
      });
    }),
});
