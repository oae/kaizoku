import { Code, Grid, LoadingOverlay, ScrollArea, Text } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { IconCheck, IconX } from '@tabler/icons';
import { useRouter } from 'next/router';
import { AddManga } from '../components/addManga';

import { EmptyPrompt } from '../components/emptyPrompt';
import { MangaCard, SkeletonMangaCard } from '../components/mangaCard';
import { trpc } from '../utils/trpc';

export default function IndexPage() {
  const libraryQuery = trpc.library.query.useQuery();
  const mangaRemove = trpc.manga.remove.useMutation();
  const router = useRouter();

  const mangaQuery = trpc.manga.query.useQuery();

  if (libraryQuery.isLoading) {
    return <LoadingOverlay visible />;
  }

  if (mangaQuery.isLoading || libraryQuery.isLoading) {
    return (
      <Grid justify="flex-start">
        {Array(10)
          .fill(0)
          .map((_, i) => {
            return (
              // eslint-disable-next-line react/no-array-index-key
              <Grid.Col span="content" key={i}>
                <SkeletonMangaCard />
              </Grid.Col>
            );
          })}
      </Grid>
    );
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
    <ScrollArea sx={{ height: 'calc(100vh - 88px)' }}>
      <Grid m={12} justify="flex-start">
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
                  badge={manga.source}
                  title={manga.title}
                  cover={manga.metadata.cover}
                  onRemove={() => handleRemove(manga.id, manga.title)}
                  onClick={() => router.push(`/manga/${manga.id}`)}
                />
              </Grid.Col>
            );
          })}
      </Grid>
    </ScrollArea>
  );
}
