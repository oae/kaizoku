import { ActionIcon, Badge, Box, createStyles, Paper, Skeleton, Title, Tooltip } from '@mantine/core';
import { Prisma } from '@prisma/client';
import { IconEdit, IconExclamationMark, IconRefresh, IconX } from '@tabler/icons-react';
import { contrastColor } from 'contrast-color';
import { motion } from 'framer-motion';
import stc from 'string-to-color';
import { useRefreshModal } from './refreshMetadata';
import { useRemoveModal } from './removeManga';
import { useUpdateModal } from './updateManga';

const useStyles = createStyles((theme, _params, getRef) => ({
  skeletonCard: {
    height: 320,
    width: 200,
  },
  card: {
    position: 'relative',
    height: 320,
    width: 200,
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    backgroundSize: 'cover',
    backgroundPosition: 'center',

    transition: 'transform 150ms ease, box-shadow 150ms ease',

    '&:hover': {
      transform: 'scale(1.01)',
      boxShadow: theme.shadows.md,
    },
    [`&:hover .${getRef('removeButton')}`]: {
      display: 'flex',
    },
    [`&:hover .${getRef('editButton')}`]: {
      display: 'flex',
    },
    [`&:hover .${getRef('refreshButton')}`]: {
      display: 'flex',
    },
  },
  removeButton: {
    ref: getRef('removeButton'),
    position: 'absolute',
    right: -5,
    top: -5,
    display: 'none',
  },
  refreshButton: {
    ref: getRef('refreshButton'),
    backgroundColor: theme.white,
    color: theme.colors.blue[6],
    position: 'absolute',
    right: 10,
    bottom: 50,
    display: 'none',
    '&:hover': {
      backgroundColor: theme.colors.gray[0],
    },
  },
  outOfSyncClass: {
    position: 'absolute',
    alignContent: 'center',
    display: 'flex',
    flexWrap: 'wrap',
    backgroundColor: theme.colors.red[6],
    border: `2px solid ${theme.white}`,
    left: 8,
    bottom: 8,
    borderRadius: 9999,
    width: 24,
    height: 24,
  },
  editButton: {
    ref: getRef('editButton'),
    backgroundColor: theme.white,
    color: theme.colors.blue[6],
    position: 'absolute',
    right: 10,
    bottom: 10,
    display: 'none',
    '&:hover': {
      backgroundColor: theme.colors.gray[0],
    },
  },
  title: {
    fontFamily: `${theme.fontFamily}`,
    fontWeight: 900,
    color: theme.white,
    lineHeight: 1.2,
    wordBreak: 'break-word',
    marginTop: theme.spacing.xs,
  },

  badge: {
    cursor: 'pointer',
  },
}));

const mangaWithLibraryAndMetadataAndOutOfSyncChapters = Prisma.validator<Prisma.MangaArgs>()({
  include: { library: true, metadata: true, outOfSyncChapters: true },
});

type MangaWithLibraryAndMetadataAndOutOfSyncChapters = Prisma.MangaGetPayload<
  typeof mangaWithLibraryAndMetadataAndOutOfSyncChapters
>;

interface MangaCardProps {
  manga: MangaWithLibraryAndMetadataAndOutOfSyncChapters;
  onRemove: (shouldRemoveFiles: boolean) => void;
  onUpdate: () => void;
  onRefresh: () => void;
  onClick: () => void;
}

export function SkeletonMangaCard() {
  const { classes } = useStyles();

  return <Skeleton radius="md" className={classes.skeletonCard} />;
}

export function MangaCard({ manga, onRemove, onUpdate, onRefresh, onClick }: MangaCardProps) {
  const { classes } = useStyles();
  const removeModal = useRemoveModal(manga.title, onRemove);
  const refreshModal = useRefreshModal(manga.title, onRefresh);
  const updateModal = useUpdateModal(manga, onUpdate);
  return (
    <Paper
      onClick={onClick}
      shadow="lg"
      p="md"
      radius="md"
      sx={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.2)), url(${manga.metadata.cover})`,
      }}
      className={classes.card}
    >
      <ActionIcon
        color="red"
        variant="filled"
        radius="xl"
        className={classes.removeButton}
        onClick={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
          e.stopPropagation();
          removeModal();
        }}
      >
        <IconX size={16} />
      </ActionIcon>
      <Tooltip withinPortal withArrow label="Refresh Metadata" position="left">
        <ActionIcon
          color="teal"
          variant="filled"
          size="lg"
          radius="xl"
          className={classes.refreshButton}
          onClick={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
            e.stopPropagation();
            refreshModal();
          }}
        >
          <IconRefresh size={18} />
        </ActionIcon>
      </Tooltip>
      <Tooltip withinPortal withArrow label="Edit" position="left">
        <ActionIcon
          color="blue"
          variant="light"
          size="lg"
          radius="xl"
          className={classes.editButton}
          onClick={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
            e.stopPropagation();
            updateModal();
          }}
        >
          <IconEdit size={18} />
        </ActionIcon>
      </Tooltip>

      {manga.outOfSyncChapters.length > 0 && (
        <Tooltip withinPortal withArrow label="This manga has out of sync chapters." position="right">
          <motion.div
            className={classes.outOfSyncClass}
            initial={{
              scale: 1,
            }}
            animate={{
              scale: [1.1, 1.0],
            }}
            exit={{
              scale: 1,
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              repeatType: 'loop',
              type: 'spring',
              stiffness: 400,
              damping: 10,
              repeatDelay: 3,
            }}
          >
            <IconExclamationMark color="white" strokeWidth={3} />
          </motion.div>
        </Tooltip>
      )}

      <div>
        <Badge
          sx={{ backgroundColor: stc(manga.source), color: contrastColor({ bgColor: stc(manga.source) }) }}
          className={classes.badge}
          size="xs"
        >
          <Box className="h-3">{manga.source}</Box>
        </Badge>
        <Title order={5} className={classes.title}>
          {manga.title}
        </Title>
      </div>
    </Paper>
  );
}
