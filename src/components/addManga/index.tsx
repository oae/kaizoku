import { createStyles, Paper, Tooltip } from '@mantine/core';
import { useModals } from '@mantine/modals';
import { IconPlus } from '@tabler/icons';
import { AddMangaForm } from './form';

const useStyles = createStyles((theme) => ({
  card: {
    height: 350,
    width: 210,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.gray[4],
    cursor: 'pointer',

    transition: 'transform 150ms ease, box-shadow 150ms ease',

    '&:hover': {
      transform: 'scale(1.01)',
      boxShadow: theme.shadows.md,
    },
  },
}));

export function AddManga({ onAdd }: { onAdd: () => void }) {
  const { classes } = useStyles();
  const modals = useModals();

  const openCreateModal = () => {
    const id = modals.openModal({
      overflow: 'inside',
      trapFocus: true,
      size: 'xl',
      closeOnClickOutside: false,
      closeOnEscape: true,
      title: 'Add a new manga',
      centered: true,
      children: (
        <AddMangaForm
          onClose={() => {
            modals.closeModal(id);
            onAdd();
          }}
        />
      ),
    });
  };

  return (
    <Tooltip label="Add a new manga" position="bottom">
      <Paper shadow="lg" p="md" radius="md" className={classes.card} onClick={openCreateModal}>
        <IconPlus color="darkblue" opacity={0.5} size={96} />
      </Paper>
    </Tooltip>
  );
}
