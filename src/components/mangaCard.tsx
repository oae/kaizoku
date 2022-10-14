import { ActionIcon, Badge, Button, Code, createStyles, Paper, Text, Title } from '@mantine/core';
import { openConfirmModal } from '@mantine/modals';
import { IconExternalLink, IconX } from '@tabler/icons';

const useStyles = createStyles((theme, _params, getRef) => ({
  card: {
    position: 'relative',
    height: 350,
    width: 210,
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
    marginTop: theme.spacing.xs,
  },

  category: {
    textTransform: 'uppercase',
  },
}));

interface ArticleCardImageProps {
  image: string;
  title: string;
  category?: string;
  onRemove: () => void;
}

const createRemoveModal = (title: string, onRemove: () => void) => {
  const openDeleteModal = () =>
    openConfirmModal({
      title: `Delete ${title}?`,
      centered: true,
      children: (
        <Text size="sm">
          Are you sure you want to delete
          <Code className="text-base font-bold" color="red">
            {title}
          </Code>
          ? This action is destructive and all downloaded files will be removed
        </Text>
      ),
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: onRemove,
    });

  return openDeleteModal;
};

export function MangaCard({ image, title, category, onRemove }: ArticleCardImageProps) {
  const { classes } = useStyles();
  const removeModal = createRemoveModal(title, onRemove);

  return (
    <Paper
      shadow="lg"
      p="md"
      radius="md"
      sx={{ backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.5)), url(${image})` }}
      className={classes.card}
    >
      <ActionIcon color="red" variant="filled" radius="xl" className={classes.removeButton} onClick={removeModal}>
        <IconX size={16} />
      </ActionIcon>
      <div>
        {category && (
          <Badge color="teal" variant="filled" className={classes.category} size="md">
            {category}
          </Badge>
        )}
        <Title order={3} className={classes.title}>
          {title}
        </Title>
      </div>
      <Button leftIcon={<IconExternalLink size={16} />} variant="filled" color="indigo" size="xs">
        Read
      </Button>
    </Paper>
  );
}

MangaCard.defaultProps = {
  category: '',
};
