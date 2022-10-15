import { createStyles, Grid, Group, Image, Kbd, Text, UnstyledButton } from '@mantine/core';
import { openSpotlight, SpotlightAction, SpotlightProvider } from '@mantine/spotlight';
import { IconSearch } from '@tabler/icons';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { trpc } from '../utils/trpc';

const useStyles = createStyles((theme, { disabled }: { disabled: boolean }) => ({
  root: {
    height: 34,
    width: 250,
    paddingLeft: theme.spacing.sm,
    paddingRight: 10,
    borderRadius: theme.radius.sm,
    color: theme.colors.gray[5],
    backgroundColor: disabled ? theme.colors.gray[3] : theme.white,
    cursor: disabled ? 'not-allowed' : 'pointer',
    outline: '0 !important',
  },
}));

export function SearchControl() {
  const [actions, setActions] = useState<SpotlightAction[]>([]);
  const router = useRouter();
  const mangaQuery = trpc.manga.query.useQuery();
  const isDisabled = !mangaQuery.data || mangaQuery.data.length === 0;
  const { classes, cx } = useStyles({ disabled: isDisabled });

  useEffect(() => {
    if (mangaQuery.data) {
      setActions(
        mangaQuery.data.map((m) => ({
          title: m.title,
          description: m.title,
          group: m.source,
          icon: (
            <Image
              withPlaceholder
              placeholder={<Image src="/cover-not-found.jpg" alt={m.title} width={63} height={96} />}
              src={m.cover}
              width={42}
              height={64}
            />
          ),
          closeOnTrigger: true,
          onTrigger: () => router.push(`/manga/${m.id}`),
        })),
      );
    }
  }, [mangaQuery.data, router]);

  return (
    <SpotlightProvider
      actions={actions}
      searchIcon={<IconSearch size={18} />}
      highlightQuery
      disabled={isDisabled}
      searchPlaceholder="Search..."
      shortcut="ctrl + p"
      nothingFoundMessage="Nothing found..."
    >
      <UnstyledButton className={cx(classes.root)} onClick={() => openSpotlight()} disabled={isDisabled}>
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
