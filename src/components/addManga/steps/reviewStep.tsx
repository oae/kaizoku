import { Badge, createStyles, Divider, Grid, Group, Image, LoadingOverlay, Text, Title, Tooltip } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { trpc } from '../../../utils/trpc';
import type { FormType } from '../form';

const useStyles = createStyles((_theme) => ({
  placeHolder: {
    alignItems: 'start !important',
    justifyContent: 'flex-start !important',
  },
}));

export function ReviewStep({ form }: { form: UseFormReturnType<FormType> }) {
  const query = trpc.manga.detail.useQuery(
    {
      source: form.values.source,
      title: form.values.mangaTitle,
    },
    {
      staleTime: Infinity,
      enabled: !!form.values.source && !!form.values.mangaTitle,
    },
  );

  const { classes } = useStyles();

  const manga = query.data;

  return (
    <>
      <LoadingOverlay visible={query.isLoading} />

      {manga && (
        <Grid>
          <Grid.Col span={4}>
            <Image
              classNames={{
                placeholder: classes.placeHolder,
              }}
              sx={(theme) => ({
                boxShadow: theme.shadows.xl,
              })}
              withPlaceholder
              placeholder={
                <Image
                  sx={(theme) => ({
                    width: 210,
                    boxShadow: theme.shadows.xl,
                  })}
                  src="/cover-not-found.jpg"
                  alt={manga.Name}
                />
              }
              src={manga.Metadata.Cover}
            />
          </Grid.Col>
          <Grid.Col span={8}>
            <Divider mb="xs" labelPosition="center" label={<Title order={3}>{manga.Name}</Title>} />
            {manga.Metadata.Synonyms && (
              <Group spacing="xs">
                {manga.Metadata.Synonyms.map((synonym) => (
                  <Tooltip label={synonym} key={synonym}>
                    <div style={{ maxWidth: 100 }}>
                      <Badge color="blue" variant="filled" size="sm" fullWidth>
                        {synonym}
                      </Badge>
                    </div>
                  </Tooltip>
                ))}
              </Group>
            )}
            <Divider variant="dashed" my="xs" label="Status" />
            {manga.Metadata.Status ? (
              <Badge color="cyan" variant="filled" size="sm">
                {manga.Metadata.Status}
              </Badge>
            ) : (
              <Text size="sm">No status...</Text>
            )}
            <Divider variant="dashed" my="xs" label="Chapters" />
            <Text>
              There are &nbsp;
              <Badge color="teal" variant="outline" size="lg">
                {manga.Chapters?.length || 0}
              </Badge>
              &nbsp; chapters
            </Text>
            <Divider variant="dashed" my="xs" label="Summary" />
            <Text size="sm">{manga.Metadata.Summary || 'No summary...'}</Text>
            <Divider variant="dashed" my="xs" label="Genres" />
            {manga.Metadata.Genres ? (
              <Group spacing="xs">
                {manga.Metadata.Genres.map((genre) => (
                  <Tooltip label={genre} key={genre}>
                    <div style={{ maxWidth: 100 }}>
                      <Badge color="indigo" variant="light" size="xs" fullWidth>
                        {genre}
                      </Badge>
                    </div>
                  </Tooltip>
                ))}
              </Group>
            ) : (
              <Text size="sm">No genres...</Text>
            )}
            <Divider variant="dashed" my="xs" label="Tags" />
            {manga.Metadata.Tags ? (
              <Group spacing="xs">
                {manga.Metadata.Tags.map((tag) => (
                  <Tooltip label={tag} key={tag}>
                    <div style={{ maxWidth: 100 }}>
                      <Badge color="violet" variant="light" size="xs" fullWidth>
                        {tag}
                      </Badge>
                    </div>
                  </Tooltip>
                ))}
              </Group>
            ) : (
              <Text size="sm">No tags...</Text>
            )}
          </Grid.Col>
        </Grid>
      )}
    </>
  );
}
