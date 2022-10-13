import { Box, LoadingOverlay, Select } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { trpc } from '../../../utils/trpc';
import type { FormType } from '../form';

export function SourceStep({ form }: { form: UseFormReturnType<FormType> }) {
  const query = trpc.manga.sources.useQuery(undefined, {
    staleTime: Infinity,
  });

  if (query.isLoading) {
    return <LoadingOverlay visible />;
  }

  const selectData = query.data?.map((s) => ({
    value: s,
    label: s,
  }));

  return (
    <Box>
      <Select
        data={selectData || []}
        label="Available sources"
        placeholder="Select a source"
        {...form.getInputProps('source')}
      />
    </Box>
  );
}
