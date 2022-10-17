import {
  ActionIcon,
  Alert,
  Badge,
  Box,
  Button,
  Checkbox,
  Code,
  createStyles,
  Paper,
  Skeleton,
  Text,
  Title,
} from '@mantine/core';
import { useModals } from '@mantine/modals';
import { IconX } from '@tabler/icons';
import { contrastColor } from 'contrast-color';
import { useState } from 'react';
import stc from 'string-to-color';

const useStyles = createStyles((theme, _params, getRef) => ({
  skeletonCard: {
    height: 350,
    width: 210,
  },
  card: {
    position: 'relative',
    height: 350,
    width: 210,
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
  },
  removeButton: {
    ref: getRef('removeButton'),
    position: 'absolute',
    right: -5,
    top: -5,
    display: 'none',
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

interface ArticleCardImageProps {
  cover: string;
  title: string;
  badge: string;
  onRemove: (shouldRemoveFiles: boolean) => void;
  onClick: () => void;
}

function RemoveModalContent({
  title,
  onRemove,
  onClose,
}: {
  title: string;
  onRemove: (shouldRemoveFiles: boolean) => void;
  onClose: () => void;
}) {
  const [shouldRemoveFiles, setShouldRemoveFiles] = useState(false);
  return (
    <>
      <Text mb={4} size="sm">
        Are you sure you want to remove
        <Code className="text-base font-bold" color="red">
          {title}
        </Code>
        ?
      </Text>
      <Alert
        icon={
          <Checkbox
            checked={shouldRemoveFiles}
            color="red"
            onChange={(event) => setShouldRemoveFiles(event.currentTarget.checked)}
          />
        }
        title="Remove files?"
        color="red"
      >
        This action is destructive and all downloaded files will be removed
      </Alert>
      <Box
        sx={(theme) => ({
          display: 'flex',
          gap: theme.spacing.xs,
          justifyContent: 'end',
          marginTop: theme.spacing.md,
        })}
      >
        <Button variant="default" color="dark" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="filled"
          color="red"
          onClick={() => {
            onRemove(shouldRemoveFiles);
            onClose();
          }}
        >
          Remove
        </Button>
      </Box>
    </>
  );
}

const useRemoveModal = (title: string, onRemove: (shouldRemoveFiles: boolean) => void) => {
  const modals = useModals();

  const openRemoveModal = () => {
    const id = modals.openModal({
      title: `Remove ${title}?`,
      centered: true,
      children: <RemoveModalContent title={title} onRemove={onRemove} onClose={() => modals.closeModal(id)} />,
    });
  };

  return openRemoveModal;
};

export function SkeletonMangaCard() {
  const { classes } = useStyles();

  return <Skeleton radius="md" className={classes.skeletonCard} />;
}

export function MangaCard({ cover, title, badge, onRemove, onClick }: ArticleCardImageProps) {
  const { classes } = useStyles();
  const removeModal = useRemoveModal(title, onRemove);

  return (
    <Paper
      onClick={onClick}
      shadow="lg"
      p="md"
      radius="md"
      sx={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.2)), url(${cover})`,
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
      <div>
        <Badge
          sx={{ backgroundColor: stc(badge), color: contrastColor({ bgColor: stc(badge) }) }}
          className={classes.badge}
          size="xs"
        >
          {badge}
        </Badge>
        <Title order={3} className={classes.title}>
          {title}
        </Title>
      </div>
    </Paper>
  );
}
