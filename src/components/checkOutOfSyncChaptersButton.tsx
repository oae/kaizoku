import { ActionIcon, Code, Text, Tooltip } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { IconCheck, IconRefreshAlert, IconX } from '@tabler/icons-react';
import { useRouter } from 'next/router';
import { trpc } from '../utils/trpc';
import { useOutOfSyncChapterModal } from './outOfSyncChapterModal';

export function CheckOutOfSyncChaptersButton() {
  const router = useRouter();
  const { id } = router.query;

  const checkOutOfSyncChaptersMutation = trpc.manga.checkOutOfSyncChapters.useMutation();

  const check = async () => {
    try {
      await checkOutOfSyncChaptersMutation.mutateAsync({ id: id ? parseInt(id as string, 10) : null });
      showNotification({
        icon: <IconCheck size={18} />,
        color: 'teal',
        autoClose: true,
        title: 'Out of Sync Chapters',
        message: <Text>Started checking for out of sync chapters in background</Text>,
      });
    } catch (err) {
      showNotification({
        icon: <IconX size={18} />,
        color: 'red',
        autoClose: true,
        title: 'Out of Sync Chapters',
        message: (
          <Text>
            <Code color="red">{`${err}`}</Code>
          </Text>
        ),
      });
    }
  };

  const outOfSyncChapterModal = useOutOfSyncChapterModal(
    'Check for out of sync chapters?',
    'This will look for out of sync chapters and mark them',
    check,
  );

  return (
    <Tooltip withArrow position="bottom-end" label="Check for the out of sync chapters">
      <ActionIcon
        onClick={outOfSyncChapterModal}
        variant="transparent"
        sx={(theme) => ({
          backgroundColor: theme.white,
          color: theme.black,
          '&:hover': {
            backgroundColor: theme.colors.gray[0],
          },
        })}
        size="lg"
      >
        <IconRefreshAlert size={18} strokeWidth={2} />
      </ActionIcon>
    </Tooltip>
  );
}
