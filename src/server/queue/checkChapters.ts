import { Prisma } from '@prisma/client';
import { Job, Queue, Worker } from 'bullmq';
import path from 'path';
import { logger } from '../../utils/logging';
import { sanitizer } from '../../utils';
import { prisma } from '../db/client';
import { findMissingChapterFiles, getChaptersFromLocal } from '../utils/mangal';
import { downloadQueue } from './download';

const mangaWithLibraryAndMetadata = Prisma.validator<Prisma.MangaArgs>()({
  include: { library: true, metadata: true },
});

export type MangaWithLibraryAndMetadata = Prisma.MangaGetPayload<typeof mangaWithLibraryAndMetadata>;

const checkChapters = async (manga: MangaWithLibraryAndMetadata) => {
  logger.info(`Checking for new chapters: ${manga.title}`);
  const mangaDir = path.resolve(manga.library.path, sanitizer(manga.title));
  const missingChapterFiles = await findMissingChapterFiles(mangaDir, manga.source, manga.title);

  const localChapters = await getChaptersFromLocal(mangaDir);
  const dbChapters = await prisma.chapter.findMany({
    where: {
      mangaId: manga.id,
    },
  });

  const dbOnlyChapters = dbChapters.filter(
    (dbChapter) => localChapters.findIndex((localChapter) => localChapter.index === dbChapter.index) < 0,
  );

  const missingDbChapters = localChapters.filter(
    (localChapter) => dbChapters.findIndex((dbChapter) => dbChapter.index === localChapter.index) < 0,
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
        manga,
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
    const { manga }: { manga: MangaWithLibraryAndMetadata } = job.data;
    await checkChapters(manga);
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

export const schedule = async (manga: MangaWithLibraryAndMetadata) => {
  if (manga.interval === 'never') {
    return;
  }

  await removeJob(manga.title);
  const jobId = getJobIdFromTitle(manga.title);

  await checkChaptersQueue.add(
    jobId,
    {
      manga,
    },
    {
      jobId,
      repeatJobKey: jobId,
      repeat: {
        pattern: manga.interval,
      },
    },
  );

  await checkChapters(manga);
};
