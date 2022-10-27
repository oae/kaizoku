import { Box, LoadingOverlay, Select, Stack, TextInput } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { IconFolderPlus } from '@tabler/icons';
import { useState } from 'react';
import { getCronLabel, isCronValid, sanitizer } from '../../../utils';
import { trpc } from '../../../utils/trpc';
import type { FormType } from '../form';

export function DownloadStep({ form }: { form: UseFormReturnType<FormType> }) {
  const [data, setData] = useState(
    ['0 0 * * *', '0 * * * *', '0 0 * * 7', 'never'].map((value) => ({
      label: getCronLabel(value),
      value,
    })),
  );
  const libraryQuery = trpc.library.query.useQuery();

  const libraryPath = libraryQuery.data?.path;

  if (libraryQuery.isLoading) {
    return <LoadingOverlay visible />;
  }

  const downloadPath = `${libraryPath}/${sanitizer(form.values.mangaTitle)}`;

  return (
    <Box>
      <Stack>
        <Select
          data-autofocus
          searchable
          clearable
          creatable
          size="sm"
          data={data}
          label="Download Interval"
          placeholder="Select or create an interval"
          getCreateLabel={(query) => {
            if (isCronValid(query)) {
              return `+ Download ${getCronLabel(query)}`;
            }

            return `+ Create ${query}`;
          }}
          onCreate={(query) => {
            if (!isCronValid(query)) {
              form.setFieldError('interval', 'Invalid interval');
              return null;
            }
            const item = { value: query, label: getCronLabel(query) };
            setData((current) => [...current.filter((i) => i.value !== query), item]);
            return item;
          }}
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
