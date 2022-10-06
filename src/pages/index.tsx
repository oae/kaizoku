import { LoadingOverlay } from '@mantine/core';
import { useRouter } from 'next/router';

import { EmptyPrompt } from '../components/emptyPrompt';
import { trpc } from '../utils/trpc';

export default function IndexPage() {
  const libraryQuery = trpc.library.query.useQuery();
  const router = useRouter();

  if (libraryQuery.isLoading) {
    return <LoadingOverlay visible overlayBlur={2} />;
  }

  if (libraryQuery.data) {
    router.push(`/library/${libraryQuery.data.id}`);
    return <LoadingOverlay visible overlayBlur={2} />;
  }

  return <EmptyPrompt />;
}
