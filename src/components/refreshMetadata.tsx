import { Box, Button, Text } from '@mantine/core';
import { useModals } from '@mantine/modals';

function RefreshMetadataModalContent({ onRefresh, onClose }: { onRefresh: () => void; onClose: () => void }) {
  return (
    <>
      <Text mb={4} size="sm">
        This will update all downloaded chapters with the latest metadata from AniList
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
            onRefresh();
            onClose();
          }}
        >
          Refresh
        </Button>
      </Box>
    </>
  );
}

export const useRefreshModal = (title: string, onRefresh: () => void) => {
  const modals = useModals();

  const openRemoveModal = () => {
    const id = modals.openModal({
      title: `Refresh Metadata for ${title}?`,
      centered: true,
      children: <RefreshMetadataModalContent onRefresh={onRefresh} onClose={() => modals.closeModal(id)} />,
    });
  };

  return openRemoveModal;
};
