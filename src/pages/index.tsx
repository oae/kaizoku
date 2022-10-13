import { Grid, LoadingOverlay } from '@mantine/core';
import { AddManga } from '../components/addManga';

import { EmptyPrompt } from '../components/emptyPrompt';
import { MangaCard } from '../components/mangaCard';
import { trpc } from '../utils/trpc';

export default function IndexPage() {
  const libraryQuery = trpc.library.query.useQuery();

  const libraryId = libraryQuery.data?.id;

  const mangaQuery = trpc.manga.query.useQuery(
    {
      library: libraryId!,
    },
    {
      staleTime: Infinity,
      enabled: libraryId !== undefined,
    },
  );

  if (libraryQuery.isLoading) {
    return <LoadingOverlay visible overlayBlur={2} />;
  }

  if (!libraryQuery.data) {
    return (
      <EmptyPrompt
        onCreate={() => {
          libraryQuery.refetch();
        }}
      />
    );
  }

  return (
    <Grid justify="flex-start">
      <Grid.Col span="content">
        <AddManga
          onAdd={() => {
            mangaQuery.refetch();
          }}
        />
      </Grid.Col>
      {mangaQuery.data &&
        mangaQuery.data.map((manga) => {
          return (
            <Grid.Col span="content" key={manga.id}>
              <MangaCard category={manga.interval} title={manga.title} image={manga.cover} />
            </Grid.Col>
          );
        })}
    </Grid>
  );
}
