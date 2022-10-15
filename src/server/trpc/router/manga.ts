import { TRPCError } from '@trpc/server';
import path from 'path';
import { z } from 'zod';
import { sanitizer } from '../../../utils/sanitize';
import { removeJob, schedule } from '../../queue/checkChapters';
import { downloadQueue } from '../../queue/download';
import { getAvailableSources, getMangaDetail, Manga, removeManga, search } from '../../utils/mangal';
import { t } from '../trpc';

export const mangaRouter = t.router({
  query: t.procedure.query(async ({ ctx }) => {
    return ctx.prisma.manga.findMany({ include: { metadata: true } });
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
      return ctx.prisma.manga.findUniqueOrThrow({
        include: {
          chapter: {
            orderBy: {
              index: 'asc',
            },
          },
          library: true,
          metadata: true,
        },
        where: { id },
      });
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
      })).filter((m) => !!m.title);
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
          library: true,
        },
        where: {
          id,
        },
      });
      const mangaPath = path.resolve(removed.library.path, sanitizer(removed.title));
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
      const mangaDetail: Manga | undefined = await getMangaDetail(source, title);
      const library = await ctx.prisma.library.findFirst();
      if (!mangaDetail || !library) {
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

      if (mangaDetail.Name !== title) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `${title} does not match the found manga.`,
        });
      }

      const manga = await ctx.prisma.manga.create({
        include: {
          library: true,
        },
        data: {
          source,
          title: mangaDetail.Name,
          library: {
            connect: {
              id: library.id,
            },
          },
          interval,
          metadata: {
            create: {
              cover: mangaDetail.Metadata.Cover,
              authors: mangaDetail.Metadata.Author ? [mangaDetail.Metadata.Author] : [],
              characters: mangaDetail.Metadata.Characters,
              genres: mangaDetail.Metadata.Genres,
              startDate: mangaDetail.Metadata.StartDate
                ? new Date(
                    mangaDetail.Metadata.StartDate.Year,
                    mangaDetail.Metadata.StartDate.Month,
                    mangaDetail.Metadata.StartDate.Day,
                  )
                : undefined,
              endDate: mangaDetail.Metadata.EndDate
                ? new Date(
                    mangaDetail.Metadata.EndDate.Year,
                    mangaDetail.Metadata.EndDate.Month,
                    mangaDetail.Metadata.EndDate.Day,
                  )
                : undefined,
              status: mangaDetail.Metadata.Status,
              summary: mangaDetail.Metadata.Summary,
              synonyms: mangaDetail.Metadata.Synonyms,
              tags: mangaDetail.Metadata.Tags,
              urls: mangaDetail.Metadata.URLs,
            },
          },
        },
      });

      schedule(manga);

      return manga;
    }),
  history: t.procedure.query(async ({ ctx }) => {
    return ctx.prisma.chapter.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
      include: {
        manga: {
          include: {
            metadata: true,
          },
        },
      },
    });
  }),
  activity: t.procedure.query(async () => {
    return {
      active: await downloadQueue.getActiveCount(),
      queued: await downloadQueue.getWaitingCount(),
      scheduled: await downloadQueue.getDelayedCount(),
      failed: await downloadQueue.getFailedCount(),
      completed: await downloadQueue.getCompletedCount(),
    };
  }),
});
