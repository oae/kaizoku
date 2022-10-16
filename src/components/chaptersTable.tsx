import { Prisma } from '@prisma/client';
import { DataTable } from 'mantine-datatable';

import dayjs from 'dayjs';

import { showNotification } from '@mantine/notifications';
import prettyBytes from 'pretty-bytes';
import { useEffect, useState } from 'react';
import { sanitizer } from '../utils/sanitize';

const mangaWithMetadataAndChaptersLibrary = Prisma.validator<Prisma.MangaArgs>()({
  include: { metadata: true, chapters: true, library: true },
});

export type MangaWithMetadataAndChaptersLibrary = Prisma.MangaGetPayload<typeof mangaWithMetadataAndChaptersLibrary>;

const PAGE_SIZE = 100;

export function ChaptersTable({ manga }: { manga: MangaWithMetadataAndChaptersLibrary }) {
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
      page={page}
      totalRecords={manga.chapters.length}
      onPageChange={(p) => setPage(p)}
      columns={[
        { accessor: 'Download Date', render: ({ createdAt }) => dayjs(createdAt).fromNow() },
        { accessor: 'Chapter', render: ({ index }) => `No #${index + 1}` },
        {
          accessor: 'File',
          render: ({ fileName }) => `${manga.library.path}/${sanitizer(manga.title)}/${fileName}`,
        },
        { accessor: 'Size', render: ({ size }) => prettyBytes(size) },
      ]}
      rowContextMenu={{
        items: () => [
          {
            key: 'download',
            title: 'Download Again',
            onClick: () => showNotification({ message: `Chapter queued for the download` }),
          },
        ],
      }}
    />
  );
}
