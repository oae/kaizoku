import { Prisma } from '@prisma/client';
import { DataTable } from 'mantine-datatable';

import dayjs from 'dayjs';

import { ActionIcon, Center, Tooltip } from '@mantine/core';
import { IconAlertTriangle, IconCheck, IconRefresh } from '@tabler/icons-react';
import prettyBytes from 'pretty-bytes';
import { useEffect, useState } from 'react';

const mangaWithMetadataAndChaptersAndOutOfSyncChaptersAndLibrary = Prisma.validator<Prisma.MangaArgs>()({
  include: { metadata: true, chapters: true, library: true, outOfSyncChapters: true },
});

export type MangaWithMetadataAndChaptersAndOutOfSyncChaptersAndLibrary = Prisma.MangaGetPayload<
  typeof mangaWithMetadataAndChaptersAndOutOfSyncChaptersAndLibrary
>;

const PAGE_SIZE = 100;

export function ChaptersTable({
  manga,
  onCheckOutOfSync,
}: {
  manga: MangaWithMetadataAndChaptersAndOutOfSyncChaptersAndLibrary;
  onCheckOutOfSync: () => void;
}) {
  const [page, setPage] = useState(1);
  const [records, setRecords] = useState(manga.chapters.slice(0, PAGE_SIZE));

  useEffect(() => {
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE;
    setRecords(manga.chapters.slice(from, to));
  }, [manga.chapters, page]);

  return (
    <DataTable
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
              <Tooltip withArrow label="Check for out of sync chapters">
                <ActionIcon
                  variant="transparent"
                  color="blue"
                  onClick={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
                    e.stopPropagation();
                    onCheckOutOfSync();
                  }}
                >
                  <IconRefresh size={16} />
                </ActionIcon>
              </Tooltip>
            </Center>
          ),
          width: 90,
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
