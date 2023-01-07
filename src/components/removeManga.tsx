import { Alert, Box, Button, Checkbox, Code, Text } from '@mantine/core';
import { useModals } from '@mantine/modals';
import { useState } from 'react';

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

export const useRemoveModal = (title: string, onRemove: (shouldRemoveFiles: boolean) => void) => {
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
