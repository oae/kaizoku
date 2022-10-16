import { Box, LoadingOverlay } from '@mantine/core';
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
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 88px)' }}>
      <Box sx={{ flexBasis: 'fit-content' }}>
        <MangaDetail manga={mangaQuery.data} />
      </Box>
      <Box sx={{ marginTop: 20, overflow: 'hidden', flex: 1 }}>
        <ChaptersTable manga={mangaQuery.data} />
      </Box>
    </Box>
  );
}
