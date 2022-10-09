import { Box, Button, Code, LoadingOverlay, Text, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useModals } from '@mantine/modals';
import { showNotification } from '@mantine/notifications';
import { IconCheck, IconX } from '@tabler/icons';
import { useState } from 'react';
import { MdOutlineCreateNewFolder } from 'react-icons/md';
import { trpc } from '../utils/trpc';

function Form({ onClose }: { onClose: () => void }) {
  const [visible, setVisible] = useState(false);

  const libraryMutation = trpc.library.create.useMutation();

  const form = useForm({
    initialValues: {
      library: {
        path: '',
      },
    },
    validate: {
      library: {
        path: (value) => (value.trim().length === 0 ? 'Path cannot be empty' : null),
      },
    },
  });

  return (
    <form
      onSubmit={form.onSubmit(async (values) => {
        setVisible((v) => !v);
        try {
          await libraryMutation.mutateAsync({
            path: values.library.path,
          });
        } catch (err) {
          showNotification({
            icon: <IconX size={18} />,
            color: 'red',
            autoClose: true,
            title: 'Library',
            message: (
              <Text>
                Failed to create library. <Code color="red">{`${err}`}</Code>
              </Text>
            ),
          });

          form.reset();
          onClose();
          setVisible((v) => !v);
          return;
        }
        form.reset();
        onClose();
        setVisible((v) => !v);
        showNotification({
          icon: <IconCheck size={18} />,
          color: 'teal',
          autoClose: true,
          title: 'Library',
          message: (
            <Text>
              Library is created at <Code color="blue">{values.library.path}</Code>
            </Text>
          ),
        });
      })}
    >
      <LoadingOverlay visible={visible} overlayBlur={2} />
      <TextInput label="Library path" placeholder="./library" {...form.getInputProps('library.path')} />

      <Box
        sx={(theme) => ({
          display: 'flex',
          gap: theme.spacing.xs,
          justifyContent: 'end',
          marginTop: theme.spacing.md,
        })}
      >
        <Button
          variant="white"
          color="red"
          onClick={() => {
            form.reset();
            onClose();
          }}
        >
          Cancel
        </Button>
        <Button type="submit" variant="light" color="cyan">
          Create
        </Button>
      </Box>
    </form>
  );
}

export function AddLibrary() {
  const modals = useModals();

  const openCreateModal = () => {
    const id = modals.openModal({
      title: 'Create a Library',
      centered: true,
      children: <Form onClose={() => modals.closeModal(id)} />,
    });
  };

  return (
    <Button type="submit" onClick={openCreateModal} leftIcon={<MdOutlineCreateNewFolder size={20} />}>
      Create a library
    </Button>
  );
}
