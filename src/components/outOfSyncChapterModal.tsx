import { Box, Button, Text } from '@mantine/core';
import { useModals } from '@mantine/modals';

function OutOfSyncChapterModalContent({
  onOk,
  onClose,
  body,
}: {
  onOk: () => void;
  onClose: () => void;
  body: string;
}) {
  return (
    <>
      <Text mb={4} size="sm">
        {body}
      </Text>
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
          color="teal"
          onClick={() => {
            onOk();
            onClose();
          }}
        >
          Ok
        </Button>
      </Box>
    </>
  );
}

export const useOutOfSyncChapterModal = (title: string, body: string, onOk: () => void) => {
  const modals = useModals();

  const openRemoveModal = () => {
    const id = modals.openModal({
      title,
      centered: true,
      children: <OutOfSyncChapterModalContent onOk={onOk} onClose={() => modals.closeModal(id)} body={body} />,
    });
  };

  return openRemoveModal;
};
