import { Grid, LoadingOverlay } from '@mantine/core';
import { useRouter } from 'next/router';
import { MangaCard } from '../../components/mangaCard';
import { NewMangaCard } from '../../components/newMangaCard';
import { trpc } from '../../utils/trpc';

export default function LibraryPage() {
  const router = useRouter();
  const { id } = router.query;
  const mangaQuery = trpc.manga.query.useQuery(
    {
      library: parseInt(id as string, 10),
    },
    {
      staleTime: Infinity,
      enabled: id !== undefined,
    },
  );

  if (mangaQuery.isLoading) {
    return <LoadingOverlay visible overlayBlur={2} />;
  }

  return (
    <Grid justify="flex-start">
      <Grid.Col span="content">
        <NewMangaCard
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
