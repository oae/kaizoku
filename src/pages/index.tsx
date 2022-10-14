import { Code, Grid, LoadingOverlay, Text } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { IconCheck, IconX } from '@tabler/icons';
import { useRouter } from 'next/router';
import { AddManga } from '../components/addManga';

import { EmptyPrompt } from '../components/emptyPrompt';
import { MangaCard } from '../components/mangaCard';
import { trpc } from '../utils/trpc';

export default function IndexPage() {
  const libraryQuery = trpc.library.query.useQuery();
  const mangaRemove = trpc.manga.remove.useMutation();
  const router = useRouter();

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

  const handleRemove = async (id: number, title: string) => {
    try {
      await mangaRemove.mutateAsync({
        id,
      });
      showNotification({
        icon: <IconCheck size={18} />,
        color: 'teal',
        autoClose: true,
        title: 'Manga',
        message: (
          <Text>
            <Code color="blue">{title}</Code> is removed from library
          </Text>
        ),
      });
    } catch (err) {
      showNotification({
        icon: <IconX size={18} />,
        color: 'red',
        autoClose: true,
        title: 'Manga',
        message: (
          <Text>
            <Code color="red">{`${err}`}</Code>
          </Text>
        ),
      });
    }
    mangaQuery.refetch();
  };

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
              <MangaCard
                interval={manga.interval}
                title={manga.title}
                cover={manga.cover}
                onRemove={() => handleRemove(manga.id, manga.title)}
                onClick={() => router.push(`/manga/${manga.id}`)}
              />
            </Grid.Col>
          );
        })}
    </Grid>
  );
}
