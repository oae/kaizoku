import {
  Badge,
  Box,
  createStyles,
  Divider,
  Grid,
  Image,
  MantineColor,
  Navbar,
  SimpleGrid,
  Skeleton,
  Text,
  Timeline,
} from '@mantine/core';
import {
  IconActivity,
  IconAlertTriangle,
  IconCalendarStats,
  IconCircleCheck,
  IconClock,
  IconFileReport,
} from '@tabler/icons';
import { inferProcedureOutput } from '@trpc/server';
import dayjs from 'dayjs';
import prettyBytes from 'pretty-bytes';

import { NextLink } from '@mantine/next';
import relativeTime from 'dayjs/plugin/relativeTime';
import { ReactNode, useEffect, useState } from 'react';
import { AppRouter } from '../server/trpc/router';
import { trpc } from '../utils/trpc';

dayjs.extend(relativeTime);

const useStyles = createStyles((theme) => ({
  navbar: {
    paddingTop: 0,
    boxShadow: theme.shadows.md,
    overflowY: 'auto',
    fontSize: theme.fontSizes.xs,
  },
  history: {
    textDecoration: 'none',
  },
  badge: {
    padding: 5,
    minWidth: 20,
    pointerEvents: 'none',
  },
  activity: {
    display: 'block',
    textDecoration: 'none',
    paddingLeft: theme.spacing.xs,
    paddingTop: theme.spacing.xs,
    paddingBottom: theme.spacing.xs,
    borderRadius: theme.radius.sm,
    color: theme.colors.gray[7],

    '&:hover': {
      backgroundColor: theme.colors.gray[0],
    },
  },
}));

function NavBarSkeleton() {
  return (
    <Box>
      <Skeleton height={10} width="100%" mb={10} radius="xl" />
      <Skeleton height={10} width={150} mb={10} radius="xl" />
      <Skeleton height={10} width={180} mb={10} radius="xl" />
      <Skeleton height={10} width={120} mb={10} radius="xl" />
    </Box>
  );
}
type ArrayElement<ArrayType extends readonly unknown[]> = ArrayType extends readonly (infer ElementType)[]
  ? ElementType
  : never;

type HistoryType = inferProcedureOutput<AppRouter['manga']['history']>;
type HistoryItemType = ArrayElement<inferProcedureOutput<AppRouter['manga']['history']>>;

function HistoryItemTitle({ chapter }: { chapter: HistoryItemType }) {
  const { classes } = useStyles();
  return (
    <Grid gutter={5}>
      <Grid.Col span="content" style={{ maxWidth: 180, whiteSpace: 'nowrap', overflow: 'hidden' }}>
        <Text weight={600}>{chapter.manga.title}</Text>
      </Grid.Col>
      <Grid.Col span="auto">
        <Divider mt="xs" variant="dotted" />
      </Grid.Col>
      <Grid.Col span="content">
        <Badge size="sm" variant="light" color="indigo" className={classes.badge}>
          #{chapter.index + 1}
        </Badge>
      </Grid.Col>
    </Grid>
  );
}

function HistoryItem({ chapter }: { chapter: HistoryItemType }) {
  const [time, setTime] = useState(dayjs(chapter.createdAt).fromNow());

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTime(dayjs(chapter.createdAt).fromNow());
    }, 60000);
    return () => {
      clearInterval(intervalId);
    };
  });

  return (
    <>
      <Text color="dimmed" size="xs" weight={500} style={{ wordBreak: 'break-word' }}>
        A new chapter downloaded as{' '}
        <Text size="xs" weight={600}>
          {chapter.fileName}
        </Text>
      </Text>
      <SimpleGrid cols={2} mt={4}>
        <Badge variant="light" size="xs" color="cyan" leftSection={<IconClock size={12} />}>
          {time}
        </Badge>
        <Badge variant="light" size="xs" color="violet" leftSection={<IconFileReport size={12} />}>
          {prettyBytes(chapter.size)}
        </Badge>
      </SimpleGrid>
    </>
  );
}

function History({ data }: { data: HistoryType }) {
  const { classes } = useStyles();

  return (
    <Timeline lineWidth={2} className={classes.history}>
      {data.map((chapter) => {
        return (
          <Timeline.Item
            key={chapter.id}
            lineVariant="dotted"
            bullet={<Image mt={20} alt="header" src={chapter.manga.metadata.cover} height={40} width={26} />}
            title={<HistoryItemTitle chapter={chapter} />}
          >
            <HistoryItem chapter={chapter} />
          </Timeline.Item>
        );
      })}
    </Timeline>
  );
}

function ActivityItem({
  name,
  icon,
  count,
  href,
  color,
}: {
  name: string;
  icon: ReactNode;
  count: number;
  href: string;
  color: MantineColor;
}) {
  const { classes } = useStyles();

  return (
    <NextLink target="_blank" href={href} className={classes.activity}>
      <Grid gutter={5}>
        <Grid.Col span="content" style={{ display: 'flex', alignItems: 'center' }}>
          {icon}
          <Text ml={5} component="span" inline weight={600}>
            {name}
          </Text>
        </Grid.Col>
        <Grid.Col span="auto" />
        <Grid.Col span="content">
          <Badge size="md" variant="dot" color={color} className={classes.badge}>
            {count}
          </Badge>
        </Grid.Col>
      </Grid>
    </NextLink>
  );
}

type ActivityType = inferProcedureOutput<AppRouter['manga']['activity']>;

function Activity({ data }: { data: ActivityType }) {
  return (
    <>
      <ActivityItem
        icon={<IconActivity size={20} strokeWidth={1.5} />}
        name="Active"
        color="teal"
        count={data.active}
        href="/admin/queues/queue/downloadQueue?status=active"
      />
      <ActivityItem
        icon={<IconClock size={20} strokeWidth={1.5} />}
        name="Queued"
        color="cyan"
        count={data.queued}
        href="/admin/queues/queue/downloadQueue?status=waiting"
      />
      <ActivityItem
        icon={<IconCalendarStats size={20} strokeWidth={1.5} />}
        name="Scheduled"
        color="yellow"
        count={data.scheduled}
        href="/admin/queues/queue/downloadQueue?status=delayed"
      />
      <ActivityItem
        icon={<IconAlertTriangle size={20} strokeWidth={1.5} />}
        name="Failed"
        color="red"
        count={data.failed}
        href="/admin/queues/queue/downloadQueue?status=failed"
      />
      <ActivityItem
        icon={<IconCircleCheck size={20} strokeWidth={1.5} />}
        name="Completed"
        color="dark"
        count={data.completed}
        href="/admin/queues/queue/downloadQueue?status=completed"
      />
    </>
  );
}

export function KaizokuNavbar() {
  const { classes } = useStyles();

  const historyQuery = trpc.manga.history.useQuery();
  const activityQuery = trpc.manga.activity.useQuery();
  const libraryQuery = trpc.library.query.useQuery();

  if (!libraryQuery.data) {
    return null;
  }

  return (
    <Navbar width={{ sm: 300 }} p="md" className={classes.navbar} fixed>
      <Navbar.Section>
        <Divider
          mb="md"
          labelPosition="left"
          variant="solid"
          label={
            <Text color="dimmed" size="md" weight={500}>
              Activities
            </Text>
          }
        />
        {activityQuery.isLoading && <NavBarSkeleton />}
        {activityQuery.data && <Activity data={activityQuery.data} />}
      </Navbar.Section>

      <Navbar.Section>
        <Divider
          mb="md"
          labelPosition="left"
          mt="md"
          variant="solid"
          label={
            <Text color="dimmed" size="md" weight={500}>
              Latest Downloads
            </Text>
          }
        />
        {historyQuery.isLoading && <NavBarSkeleton />}
        {historyQuery.data && <History data={historyQuery.data} />}
      </Navbar.Section>
    </Navbar>
  );
}
