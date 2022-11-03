import { createStyles, Paper, Tooltip } from '@mantine/core';
import { useModals } from '@mantine/modals';
import { IconPlus } from '@tabler/icons';
import { useMemo } from 'react';
import { AddMangaForm } from './form';

const useStyles = createStyles((theme) => ({
  card: {
    height: 350,
    width: 210,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[4],
    cursor: 'pointer',

    transition: 'transform 150ms ease, box-shadow 150ms ease',

    '&:hover': {
      transform: 'scale(1.01)',
      boxShadow: theme.shadows.md,
    },
  },

  plusIcon: {
    color: theme.colorScheme === 'light' ? theme.colors.dark[4] : theme.colors.gray[4],
  },
}));

export const useAddMangaModal = () => {
  const modals = useModals();

  return useMemo(
    () => (onAdd: () => void) => {
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
    },
    [modals],
  );
};

export function AddManga({ onAdd }: { onAdd: () => void }) {
  const { classes } = useStyles();

  const addMangaModal = useAddMangaModal();

  return (
    <Tooltip label="Add a new manga" position="bottom">
      <Paper shadow="lg" p="md" radius="md" className={classes.card} onClick={() => addMangaModal(onAdd)}>
        <IconPlus className={classes.plusIcon} opacity={0.5} size={96} />
      </Paper>
    </Tooltip>
  );
}
