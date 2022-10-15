import { Code, LoadingOverlay } from '@mantine/core';
import { useRouter } from 'next/router';
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
    return <LoadingOverlay visible overlayBlur={2} />;
  }

  if (mangaQuery.isError) {
    router.push('/404');
  }

  return <Code>{JSON.stringify(mangaQuery.data, null, 2)}</Code>;
}
