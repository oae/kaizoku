import { Prisma } from '@prisma/client';
import { Job, Queue, Worker } from 'bullmq';
import path from 'path';
import { sanitizer } from '../../utils';
import { logger } from '../../utils/logging';
import { prisma } from '../db/client';
import { findMissingChapterFiles, getChaptersFromLocal } from '../utils/mangal';
import { downloadQueue } from './download';

const mangaWithLibraryAndMetadata = Prisma.validator<Prisma.MangaArgs>()({
  include: { library: true, metadata: true },
});

export type MangaWithLibraryAndMetadata = Prisma.MangaGetPayload<typeof mangaWithLibraryAndMetadata>;

export const syncDbWithFiles = async (manga: MangaWithLibraryAndMetadata) => {
  const mangaDir = path.resolve(manga.library.path, sanitizer(manga.title));

  const localChapters = await getChaptersFromLocal(mangaDir);
  const dbChapters = await prisma.chapter.findMany({
    where: {
      mangaId: manga.id,
    },
  });

  const dbOnlyChapters = dbChapters.filter(
    (dbChapter) =>
      localChapters.findIndex(
        (localChapter) => localChapter.fileName === dbChapter.fileName && localChapter.index === dbChapter.index,
      ) < 0,
  );

  const missingDbChapters = localChapters.filter(
    (localChapter) =>
      dbChapters.findIndex(
        (dbChapter) => dbChapter.fileName === localChapter.fileName && dbChapter.index === localChapter.index,
      ) < 0,
  );

  await prisma.$transaction([
    ...dbOnlyChapters.map((chapter) =>
      prisma.chapter.delete({
        where: {
          id: chapter.id,
        },
      }),
    ),
    prisma.chapter.createMany({
      data: missingDbChapters.map((chapter) => ({
        ...chapter,
        mangaId: manga.id,
      })),
    }),
  ]);
};

const checkChapters = async (manga: MangaWithLibraryAndMetadata) => {
  logger.info(`Checking for new chapters: ${manga.title}`);
  const mangaDir = path.resolve(manga.library.path, sanitizer(manga.title));
  const missingChapterFiles = await findMissingChapterFiles(mangaDir, manga.source, manga.title);
  await syncDbWithFiles(manga);

  if (missingChapterFiles.length === 0) {
    logger.info(`There are no missing chapter files for ${manga.title}`);
    return;
  }

  logger.info(`There are ${missingChapterFiles.length} new chapters for ${manga.title}`);

  await Promise.all(
    missingChapterFiles.map(async (chapterIndex) => {
      const job = await downloadQueue.getJob(`${sanitizer(manga.title)}_${chapterIndex}_download`);
      if (job) {
        await job.remove();
      }
    }),
  );

  await downloadQueue.addBulk(
    missingChapterFiles.map((chapterIndex) => ({
      opts: {
        jobId: `${sanitizer(manga.title)}_${chapterIndex}_download`,
      },
      name: `${sanitizer(manga.title)}_chapter#${chapterIndex}_download`,
      data: {
        mangaId: manga.id,
        chapterIndex,
      },
    })),
  );
};

export const checkChaptersQueue = new Queue('checkChaptersQueue', {
  connection: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
  },
});

export const checkChaptersWorker = new Worker(
  'checkChaptersQueue',
  async (job: Job) => {
    const { mangaId } = job.data;
    const mangaInDb = await prisma.manga.findUniqueOrThrow({
      include: { library: true, metadata: true },
      where: { id: mangaId },
    });
    await checkChapters(mangaInDb);
    await job.updateProgress(100);
  },
  {
    concurrency: 5,
    connection: {
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
    },
  },
);

export const getJobIdFromTitle = (title: string) => `check_${sanitizer(title)}_chapters`;

export const removeJob = async (title: string) => {
  const jobId = getJobIdFromTitle(title);
  const jobs = await checkChaptersQueue.getJobs('delayed');
  await Promise.all(
    jobs
      .filter((job) => job.opts.repeat?.jobId === jobId)
      .map(async (job) => {
        if (job.id) {
          return checkChaptersQueue.remove(job.id);
        }
        return null;
      }),
  );
};

export const schedule = async (manga: MangaWithLibraryAndMetadata, runImmediately: boolean) => {
  await removeJob(manga.title);

  if (runImmediately === true) {
    await checkChapters(manga);
  }

  if (manga.interval === 'never') {
    return;
  }
  const jobId = getJobIdFromTitle(manga.title);

  await checkChaptersQueue.add(
    jobId,
    {
      mangaId: manga.id,
    },
    {
      jobId,
      repeatJobKey: jobId,
      repeat: {
        pattern: manga.interval,
      },
    },
  );
};

export const scheduleAll = async () => {
  const mangaList = await prisma.manga.findMany({ include: { library: true, metadata: true } });
  await Promise.all(
    mangaList.map(async (manga) => {
      await schedule(manga, false);
    }),
  );
};
