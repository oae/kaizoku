import { Prisma } from '@prisma/client';
import { DataTable } from 'mantine-datatable';

import dayjs from 'dayjs';

import { Center, Tooltip } from '@mantine/core';
import { IconAlertTriangle, IconCheck } from '@tabler/icons-react';
import prettyBytes from 'pretty-bytes';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { sanitizer } from '../utils';

const mangaWithMetadataAndChaptersAndOutOfSyncChaptersAndLibrary = Prisma.validator<Prisma.MangaArgs>()({
  include: { metadata: true, chapters: true, library: true, outOfSyncChapters: true },
});

export type MangaWithMetadataAndChaptersAndOutOfSyncChaptersAndLibrary = Prisma.MangaGetPayload<
  typeof mangaWithMetadataAndChaptersAndOutOfSyncChaptersAndLibrary
>;

const PAGE_SIZE = 100;

export function ChaptersTable({ manga }: { manga: MangaWithMetadataAndChaptersAndOutOfSyncChaptersAndLibrary }) {
  const [page, setPage] = useState(1);
  const [records, setRecords] = useState(manga.chapters.slice(0, PAGE_SIZE));

  const Router = useRouter();
  const origin =
    typeof window !== 'undefined' && window.location.origin ? window.location.origin : 'http://localhost:3000';
  const downloadPath = `${sanitizer(manga.title)}`;

  useEffect(() => {
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE;
    setRecords(manga.chapters.slice(from, to));
  }, [manga.chapters, page]);

  return (
    <DataTable
      onCellClick={({ record }) => {
        Router.push(`${origin}/api/read/title=${downloadPath}&fileName=${record.fileName}`);
      }}
      withBorder
      withColumnBorders
      striped
      highlightOnHover
      records={records}
      recordsPerPage={PAGE_SIZE}
      sx={(themes) => ({
        '*': {
          fontSize: `${themes.fontSizes.xs}px !important`,
        },
      })}
      page={page}
      totalRecords={manga.chapters.length}
      onPageChange={(p) => setPage(p)}
      columns={[
        { accessor: 'index', title: '#', render: ({ index }) => `${index + 1}` },
        { accessor: 'createdAt', title: 'Download Date', render: ({ createdAt }) => dayjs(createdAt).fromNow() },
        {
          accessor: 'fileName',
          title: 'Chapter Name',
          render: ({ fileName }) => `${fileName}`,
        },
        { accessor: 'size', title: 'File Size', render: ({ size }) => prettyBytes(size) },
        {
          accessor: '',
          title: (
            <Center>
              <span>Status</span>
            </Center>
          ),
          width: 70,
          render: ({ id }) =>
            manga.outOfSyncChapters.find((c) => c.id === id) ? (
              <Tooltip withArrow label="This chapter is out of sync with the source.">
                <Center>
                  <IconAlertTriangle color="red" size={18} strokeWidth={2} />
                </Center>
              </Tooltip>
            ) : (
              <Tooltip withArrow label="This chapter is in sync with the source.">
                <Center>
                  <IconCheck color="green" size={18} strokeWidth={3} />
                </Center>
              </Tooltip>
            ),
        },
      ]}
    />
  );
}
