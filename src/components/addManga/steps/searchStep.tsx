import { ActionIcon, LoadingOverlay, TextInput } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { getHotkeyHandler } from '@mantine/hooks';
import { IconArrowRight, IconSearch } from '@tabler/icons';
import { useState } from 'react';
import { trpc } from '../../../utils/trpc';
import { MangaSearchResult } from '../mangaSearchResult';
import type { FormType } from '../form';

export function SearchStep({ form }: { form: UseFormReturnType<FormType> }) {
  const ctx = trpc.useContext();
  type SearchResult = Awaited<ReturnType<typeof ctx.manga.search.fetch>>;

  const [loading, setLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<SearchResult>([]);

  const handleSearch = async () => {
    form.validateField('query');
    if (!form.isValid('query')) {
      return;
    }
    form.setFieldValue('mangaTitle', '');
    setLoading(true);
    const result = await ctx.manga.search.fetch({
      keyword: form.values.query,
      source: form.values.source,
    });
    setLoading(false);

    if (result) {
      setSearchResult(result);
    }
  };

  return (
    <>
      <LoadingOverlay visible={loading} />

      <TextInput
        data-autofocus
        mb="xl"
        size="md"
        radius="xl"
        onKeyDown={getHotkeyHandler([['Enter', handleSearch]])}
        icon={<IconSearch size={18} stroke={1.5} />}
        rightSection={
          <ActionIcon size={32} radius="xl" color="blue" variant="filled" onClick={handleSearch}>
            <IconArrowRight size={18} stroke={1.5} />
          </ActionIcon>
        }
        rightSectionWidth={42}
        label="Search for a manga"
        placeholder="Bleach"
        {...form.getInputProps('query')}
      />
      <TextInput hidden {...form.getInputProps('mangaTitle')} />
      <MangaSearchResult
        items={searchResult}
        onSelect={(selected) => {
          if (selected) {
            form.setFieldValue('mangaTitle', selected.title);
          } else {
            form.setFieldValue('mangaTitle', '');
          }
        }}
      />
    </>
  );
}
