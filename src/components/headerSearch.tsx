import { createStyles, Grid, Group, Image, Kbd, Text, UnstyledButton } from '@mantine/core';
import { openSpotlight, SpotlightAction, SpotlightProvider } from '@mantine/spotlight';
import { IconSearch } from '@tabler/icons';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { trpc } from '../utils/trpc';
import { useAddMangaModal } from './addManga';

const useStyles = createStyles((theme) => ({
  root: {
    height: 34,
    width: 250,
    paddingLeft: theme.spacing.sm,
    paddingRight: 10,
    borderRadius: theme.radius.sm,
    color: theme.colors.gray[5],
    backgroundColor: theme.white,
    cursor: 'pointer',
    outline: '0 !important',
  },
}));

export function SearchControl() {
  const [actions, setActions] = useState<SpotlightAction[]>([]);
  const addMangaModal = useAddMangaModal();

  const router = useRouter();
  const mangaQuery = trpc.manga.query.useQuery();
  const { classes, cx } = useStyles();

  useEffect(() => {
    if (mangaQuery.data) {
      const mangaActions: SpotlightAction[] = mangaQuery.data.map((m) => ({
        title: m.title,
        description: `${m.metadata.summary.split(' ').slice(0, 50).join(' ')}...`,
        group: m.source,
        icon: (
          <Image
            withPlaceholder
            placeholder={<Image src="/cover-not-found.jpg" alt={m.title} width={60} height={100} />}
            src={m.metadata.cover}
            width={60}
            height={100}
          />
        ),
        closeOnTrigger: true,
        onTrigger: () => router.push(`/manga/${m.id}`),
      }));

      setActions([
        {
          title: 'Add Manga',
          group: ' ',
          description: 'You can add new manga from several sources',
          icon: <Image withPlaceholder src="/new-manga.png" width={60} height={100} />,
          closeOnTrigger: true,
          onTrigger: () => addMangaModal(() => mangaQuery.refetch()),
        },
        ...mangaActions,
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addMangaModal, mangaQuery.data, router]);

  return (
    <SpotlightProvider
      actions={actions}
      searchIcon={<IconSearch size={18} />}
      highlightQuery
      limit={5}
      searchPlaceholder="Search..."
      shortcut="ctrl + p"
      nothingFoundMessage="Nothing found..."
    >
      <UnstyledButton className={cx(classes.root)} onClick={() => openSpotlight()}>
        <Grid gutter={5}>
          <Grid.Col span="content" style={{ display: 'flex', alignItems: 'center' }}>
            <IconSearch size={14} stroke={1.5} />
          </Grid.Col>
          <Grid.Col span="auto" style={{ display: 'flex', alignItems: 'center' }}>
            <Text size="sm" color="dimmed">
              Search
            </Text>
          </Grid.Col>
          <Grid.Col span="content">
            <Group spacing={5}>
              <Kbd py={0}>Ctrl</Kbd>+<Kbd py={0}>P</Kbd>
            </Group>
          </Grid.Col>
        </Grid>
      </UnstyledButton>
    </SpotlightProvider>
  );
}
