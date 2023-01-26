import { ActionIcon, Code, Text, Tooltip } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { IconCheck, IconHammer, IconX } from '@tabler/icons-react';
import { useRouter } from 'next/router';
import { trpc } from '../utils/trpc';
import { useOutOfSyncChapterModal } from './outOfSyncChapterModal';

export function FixOutOfSyncChaptersButton() {
  const router = useRouter();
  const { id } = router.query;

  const fixOutOfSyncChaptersMutation = trpc.manga.fixOutOfSyncChapters.useMutation();

  const fix = async () => {
    try {
      await fixOutOfSyncChaptersMutation.mutateAsync({ id: id ? parseInt(id as string, 10) : null });
      showNotification({
        icon: <IconCheck size={18} />,
        color: 'teal',
        autoClose: true,
        title: 'Out of Sync Chapters',
        message: <Text>Started fixing out of sync chapters in background</Text>,
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
    'Fix out of sync chapters?',
    'This will remove all chapters marked as out of sync and download the new ones',
    fix,
  );

  return (
    <Tooltip withArrow position="bottom-end" label="Fix out of sync chapters">
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
        <IconHammer size={18} strokeWidth={2} />
      </ActionIcon>
    </Tooltip>
  );
}
