import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { env } from "@/env";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export interface Source {
  id: string;
  name: string;
  lang: string;
  iconUrl: string;
  supportsLatest: boolean;
  isConfigurable: boolean;
  isNsfw: boolean;
  displayName: string;
}

interface Manga {
  mangaList: Series[];
}
export interface Series {
  id: number;
  sourceId: string;
  title: string;
  thumbnailUrl: string;
  realUrl: string;
  author: string;
  description: string;
  genre: string[];
  status: string;
  chapterCount: number;
  chapters: Chapter[];
}

export interface Chapter {
  id: number;
  url: string;
  name: string;
  uploadDate: number;
  chapterNumber: number;
  scanlator: null;
  mangaId: number;
  index: number;
  realUrl: string;
  pageCount: number;
}

export const seriesRouter = createTRPCRouter({
  availableSources: protectedProcedure.query(async () => {
    const response = await fetch(`${env.SUWAYOMI_API}/source/list`).catch(
      (e) => {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch sources from Shinigami",
          cause: e,
        });
      },
    );
    const sources = (await response.json()) as Source[];

    return sources
      .filter((source) => !env.UNSUPPORTED_SOURCES.includes(source.id))
      .map((source) => ({
        ...source,
        iconUrl: `${env.SUWAYOMI_URL}${source.iconUrl}`,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }),
  addSeries: protectedProcedure
    .input(
      z.object({
        seriesId: z.number().min(1, "Please enter a series"),
      }),
    )
    .mutation(async ({ input }) => {
      await fetch(`${env.SUWAYOMI_API}/manga/${input.seriesId}/library`).catch(
        (e) => {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to add series to Shinigami",
            cause: e,
          });
        },
      );
    }),
  fetchLibrary: protectedProcedure.query(async () => {
    const response = await fetch(`${env.SUWAYOMI_API}/category/0`).catch(
      (e) => {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch library from Shinigami",
          cause: e,
        });
      },
    );

    const library = (await response.json()) as Series[];

    return library.map((series) => ({
      id: series.id,
      sourceId: series.sourceId,
      title: series.title,
      thumbnailUrl: `${env.SUWAYOMI_URL}${series.thumbnailUrl}`,
      realUrl: series.realUrl,
      author: series.author,
      description: series.description,
      genre: series.genre,
      status: series.status,
      chapters: series.chapters ?? [],
      chapterCount: series.chapterCount,
    }));
  }),
  fetchFullSeriesData: protectedProcedure
    .input(
      z.object({
        seriesId: z.number().min(1, "Please enter a series"),
      }),
    )
    .query(async ({ input }) => {
      const chaptersResponse = await fetch(
        `${env.SUWAYOMI_API}/manga/${input.seriesId}/chapters?onlineFetch=true`,
      ).catch((e) => {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch chapters from Shinigami",
          cause: e,
        });
      });

      const response = await fetch(
        `${env.SUWAYOMI_API}/manga/${input.seriesId}/full?onlineFetch=true`,
      ).catch((e) => {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch full series data from Shinigami",
          cause: e,
        });
      });

      const series = (await response.json()) as Series;
      const chapters = (await chaptersResponse.json()) as Chapter[];

      return {
        id: series.id,
        sourceId: series.sourceId,
        title: series.title,
        thumbnailUrl: `${env.SUWAYOMI_URL}${series.thumbnailUrl}`,
        realUrl: series.realUrl,
        author: series.author,
        description: series.description,
        genre: series.genre,
        status: series.status,
        chapters: chapters ?? [],
        chapterCount: series.chapterCount,
      };
    }),
  availableSeries: protectedProcedure
    .input(
      z.object({
        sourceId: z.string().min(1, "Please enter a source"),
        keyword: z.string().optional(),
      }),
    )
    .query(async ({ input }): Promise<Series[]> => {
      let result: Series[] = [];
      if (!input.keyword) {
        const response = await fetch(
          `${env.SUWAYOMI_API}/source/${input.sourceId}/popular/1`,
        ).catch((e) => {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch popular series from Shinigami",
            cause: e,
          });
        });
        result = ((await response.json()) as Manga).mangaList;
      } else {
        const response = await fetch(
          `${env.SUWAYOMI_API}/source/${input.sourceId}/search?searchTerm=${input.keyword}&pageNum=1`,
        ).catch((e) => {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch search results from Shinigami",
            cause: e,
          });
        });
        result = ((await response.json()) as Manga).mangaList;
      }

      return result.map((series) => ({
        id: series.id,
        sourceId: series.sourceId,
        title: series.title,
        thumbnailUrl: `${env.SUWAYOMI_URL}${series.thumbnailUrl}`,
        realUrl: series.realUrl,
        author: series.author,
        description: series.description,
        genre: series.genre,
        status: series.status,
        chapters: series.chapters ?? [],
        chapterCount: series.chapterCount,
      }));
    }),
});
