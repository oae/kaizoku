import { Box, LoadingOverlay, Select, Stack, TextInput } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { IconFolderPlus } from '@tabler/icons';
import { sanitizer } from '../../../utils/sanitize';
import { trpc } from '../../../utils/trpc';
import type { FormType } from '../form';

const availableIntervals = ['daily', 'hourly', 'weekly', 'minutely'];

export function DownloadStep({ form }: { form: UseFormReturnType<FormType> }) {
  const libraryQuery = trpc.library.query.useQuery();

  const libraryPath = libraryQuery.data?.path;

  const intervalSelectData = availableIntervals.map((k) => ({ label: k, value: k }));

  if (libraryQuery.isLoading) {
    return <LoadingOverlay visible />;
  }

  const downloadPath = `${libraryPath}/${sanitizer(form.values.mangaTitle)}`;

  return (
    <Box>
      <Stack>
        <Select
          data-autofocus
          size="sm"
          data={intervalSelectData}
          label="Download Interval"
          placeholder="Select an interval"
          {...form.getInputProps('interval')}
        />
        <TextInput
          label="Location"
          size="sm"
          disabled
          icon={<IconFolderPlus size={18} stroke={1.5} />}
          value={downloadPath}
        />
      </Stack>
    </Box>
  );
}
