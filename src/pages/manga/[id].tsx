import { Grid, LoadingOverlay } from '@mantine/core';
import { useRouter } from 'next/router';
import { ChaptersTable } from '../../components/chaptersTable';
import { MangaDetail } from '../../components/mangaDetail';
import { trpc } from '../../utils/trpc';

export default function LibraryPage() {
  const router = useRouter();
  const { id } = router.query;
  const mangaQuery = trpc.manga.get.useQuery(
    {
      id: parseInt(id as string, 10),
    },
    {
      staleTime: Infinity,
      enabled: id !== undefined,
    },
  );

  if (mangaQuery.isLoading) {
    // TODO: change with skeleton
    return <LoadingOverlay visible overlayBlur={2} />;
  }

  if (mangaQuery.isError || !mangaQuery.data) {
    router.push('/404');
    return null;
  }

  return (
    <Grid gutter={5}>
      <Grid.Col span={12}>
        <MangaDetail manga={mangaQuery.data} />
      </Grid.Col>
      <Grid.Col span={12}>
        <ChaptersTable manga={mangaQuery.data} />
      </Grid.Col>
    </Grid>
  );
}
