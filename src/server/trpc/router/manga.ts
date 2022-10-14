import { TRPCError } from '@trpc/server';
import path from 'path';
import { z } from 'zod';
import { sanitizer } from '../../../utils/sanitize';
import { removeJob, schedule } from '../../queue/checkChapters';
import { getAvailableSources, getMangaDetail, removeManga, search } from '../../utils/mangal';
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
        source: z.string().trim().min(1),
        title: z.string().trim().min(1),
      }),
    )
    .query(async ({ input }) => {
      const { title, source } = input;
      return getMangaDetail(source, title);
    }),
  get: t.procedure
    .input(
      z.object({
        id: z.number(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { id } = input;
      return ctx.prisma.manga.findFirst({ where: { id } });
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
      return result.Manga.map((m) => ({
        status: m.Metadata.Status,
        title: m.Name,
        cover: m.Metadata.Cover,
      }));
    }),
  remove: t.procedure
    .input(
      z.object({
        id: z.number(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { id } = input;
      const removed = await ctx.prisma.manga.delete({
        include: {
          Library: true,
        },
        where: {
          id,
        },
      });
      const mangaPath = path.resolve(removed.Library.path, sanitizer(removed.title));
      await removeManga(mangaPath);
      await removeJob(removed.title);
    }),
  add: t.procedure
    .input(
      z.object({
        source: z.string().trim().min(1),
        title: z.string().trim().min(1),
        interval: z.string().trim().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { source, title, interval } = input;
      const detail = await getMangaDetail(source, title);
      const library = await ctx.prisma.library.findFirst();
      if (!detail || !library) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `Cannot find the ${title}.`,
        });
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

      if (detail.Name !== title) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `${title} does not match the found manga.`,
        });
      }

      const manga = await ctx.prisma.manga.create({
        include: {
          Library: true,
        },
        data: {
          cover: detail.Metadata.Cover,
          source,
          title: detail.Name,
          libraryId: library.id,
          interval,
        },
      });

      schedule(manga);

      return manga;
    }),
});
