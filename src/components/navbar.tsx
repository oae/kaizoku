import {
  Badge,
  createStyles,
  Divider,
  Grid,
  Group,
  LoadingOverlay,
  Navbar,
  Text,
  Tooltip,
  UnstyledButton,
} from '@mantine/core';
import { IconActivity, IconAlertTriangle, IconClock } from '@tabler/icons';
import { trpc } from '../utils/trpc';

const useStyles = createStyles((theme) => ({
  navbar: {
    paddingTop: 0,
    boxShadow: theme.shadows.md,
  },

  section: {
    marginLeft: -theme.spacing.md,
    marginRight: -theme.spacing.md,
    marginBottom: theme.spacing.md,

    '&:not(:last-of-type)': {
      borderBottom: `1px solid ${theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[3]}`,
    },
  },

  searchCode: {
    fontWeight: 700,
    fontSize: 10,
    backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.colors.gray[0],
    border: `1px solid ${theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.colors.gray[2]}`,
  },

  mainLinks: {
    paddingLeft: theme.spacing.md - theme.spacing.xs,
    paddingRight: theme.spacing.md - theme.spacing.xs,
    paddingBottom: theme.spacing.md,
  },

  mainLink: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    fontSize: theme.fontSizes.xs,
    padding: `8px ${theme.spacing.xs}px`,
    borderRadius: theme.radius.sm,
    fontWeight: 500,
    color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.colors.gray[7],

    '&:hover': {
      backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
      color: theme.colorScheme === 'dark' ? theme.white : theme.black,
    },
  },

  mainLinkInner: {
    display: 'flex',
    alignItems: 'center',
    flex: 1,
  },

  mainLinkIcon: {
    marginRight: theme.spacing.sm,
    color: theme.colorScheme === 'dark' ? theme.colors.dark[2] : theme.colors.gray[6],
  },

  mainLinkBadge: {
    padding: 5,
    minWidth: 20,
    pointerEvents: 'none',
  },

  collections: {
    paddingLeft: theme.spacing.md - 6,
    paddingRight: theme.spacing.md - 6,
    paddingBottom: theme.spacing.md,
  },

  collectionsHeader: {
    paddingLeft: theme.spacing.md + 2,
    paddingRight: theme.spacing.md,
    marginBottom: 5,
  },

  collectionLink: {
    display: 'block',
    padding: `8px ${theme.spacing.xs}px`,
    textDecoration: 'none',
    borderRadius: theme.radius.sm,
    fontSize: theme.fontSizes.xs,
    color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.colors.gray[7],
    lineHeight: 1,
    fontWeight: 500,

    '&:hover': {
      backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
      color: theme.colorScheme === 'dark' ? theme.white : theme.black,
    },
  },
}));

const links = [
  { icon: IconActivity, label: 'Activity', notifications: 862, color: 'teal' },
  { icon: IconClock, label: 'Queue', notifications: 38, color: 'indigo' },
  { icon: IconAlertTriangle, label: 'Failed', notifications: 4, color: 'red' },
];

const collections = [
  { chapter: 123, label: 'Jujutsu Kaisen' },
  { chapter: 2, label: 'One Piece' },
  { chapter: 42, label: 'Bleach' },
  { chapter: 36, label: 'Naruto' },
  { chapter: 98, label: 'Black Clover' },
  { chapter: 610, label: 'Fairy Tail' },
  { chapter: 133, label: 'Hunter x Hunter' },
  { chapter: 51, label: 'Noblesse' },
  { chapter: 24, label: 'Berserk' },
  { chapter: 23, label: 'Berserk' },
];

export function KaizokuNavbar() {
  const { classes } = useStyles();
  const libraryQuery = trpc.library.query.useQuery(undefined, {
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchInterval: Infinity,
  });

  const mainLinks = links.map((link) => (
    <UnstyledButton key={link.label} className={classes.mainLink}>
      <div className={classes.mainLinkInner}>
        <link.icon size={20} className={classes.mainLinkIcon} strokeWidth={1.5} />
        <span>{link.label}</span>
      </div>
      {link.notifications && (
        <Badge size="md" variant="dot" color={link.color} className={classes.mainLinkBadge}>
          {link.notifications}
        </Badge>
      )}
    </UnstyledButton>
  ));

  const collectionLinks = collections.map((collection) => (
    // eslint-disable-next-line @next/next/no-html-link-for-pages
    <a
      href="/"
      onClick={(event) => event.preventDefault()}
      key={collection.label}
      className={classes.collectionLink}
      style={{ width: 'inherit', overflowX: 'hidden' }}
    >
      <Grid gutter={5}>
        <Grid.Col span="content" style={{ maxWidth: 180, whiteSpace: 'nowrap', overflow: 'hidden' }}>
          <Tooltip label={collection.label}>
            <Text weight={600}>{collection.label}</Text>
          </Tooltip>
        </Grid.Col>
        <Grid.Col span="auto">
          <Divider mt="xs" variant="dotted" />
        </Grid.Col>
        <Grid.Col span="content">
          <Badge size="sm" variant="light" color="indigo" className={classes.mainLinkBadge}>
            #{collection.chapter}
          </Badge>
        </Grid.Col>
      </Grid>
    </a>
  ));

  if (libraryQuery.isLoading) {
    return <LoadingOverlay visible overlayBlur={2} />;
  }

  if (!libraryQuery.data) {
    return null;
  }

  return (
    <Navbar width={{ sm: 300 }} p="md" className={classes.navbar} fixed>
      <Navbar.Section className={classes.section}>
        <div className={classes.mainLinks}>{mainLinks}</div>
      </Navbar.Section>

      <Navbar.Section className={classes.section}>
        <Group className={classes.collectionsHeader} position="apart">
          <Text size="md" weight={500} color="dimmed">
            Latest Downloads
          </Text>
        </Group>
        <div className={classes.collections}>{collectionLinks}</div>
      </Navbar.Section>
    </Navbar>
  );
}
