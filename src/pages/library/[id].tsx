import { Grid } from '@mantine/core';
import { useRouter } from 'next/router';
import { MangaCard } from '../../components/mangaCard';
import { NewMangaCard } from '../../components/newMangaCard';
import { trpc } from '../../utils/trpc';

export default function LibraryPage() {
  const router = useRouter();
  const { id } = router.query;

  if (id === undefined || id === null) {
    return null;
  }

  const mangaQuery = trpc.manga.query.useQuery({
    library: parseInt(id as string, 10),
  });

  if (mangaQuery.isLoading) {
    return null;
  }

  if (!mangaQuery.data) {
    return <NewMangaCard />;
  }

  return (
    <Grid justify="center">
      <Grid.Col span="content">
        <NewMangaCard />
      </Grid.Col>
      {mangaQuery.data.map((manga) => {
        return (
          <Grid.Col span="content" key={manga.id}>
            <MangaCard category={manga.interval} title={manga.title} image={manga.cover} />
          </Grid.Col>
        );
      })}
    </Grid>
  );
}
