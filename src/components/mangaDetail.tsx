import { Badge, createStyles, Divider, Grid, Group, Image, Text, Title, Tooltip } from '@mantine/core';
import { Prisma } from '@prisma/client';

const useStyles = createStyles((_theme) => ({
  root: {},
  placeHolder: {
    alignItems: 'start !important',
    justifyContent: 'flex-start !important',
  },
}));

const mangaWithMetadataAndChapters = Prisma.validator<Prisma.MangaArgs>()({
  include: { metadata: true, chapters: true },
});

export type MangaWithMetadataAndChapters = Prisma.MangaGetPayload<typeof mangaWithMetadataAndChapters>;

export function MangaDetail({ manga }: { manga: MangaWithMetadataAndChapters }) {
  const { classes } = useStyles();

  return (
    <Grid className={classes.root}>
      <Grid.Col span="auto" style={{ maxWidth: 300 }}>
        <Image
          classNames={{
            placeholder: classes.placeHolder,
          }}
          sx={(theme) => ({
            width: 210,
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
              alt={manga.title}
            />
          }
          src={manga.metadata.cover}
        />
      </Grid.Col>
      <Grid.Col span="auto">
        <Divider mb="xs" labelPosition="left" label={<Title order={3}>{manga.title}</Title>} />
        <Group spacing="xs">
          {manga.metadata.synonyms.map((synonym) => (
            <Tooltip label={synonym} key={synonym}>
              <div style={{ maxWidth: 100 }}>
                <Badge color="blue" variant="filled" size="sm" fullWidth>
                  {synonym}
                </Badge>
              </div>
            </Tooltip>
          ))}
        </Group>
        <Divider variant="dashed" my="xs" label="Status" />
        <Badge color="cyan" variant="filled" size="sm">
          {manga.metadata.status}
        </Badge>

        <Divider variant="dashed" my="xs" label="Chapters" />
        <Text>
          There are &nbsp;
          <Badge color="teal" variant="outline" size="lg">
            {manga.chapters.length}
          </Badge>
          &nbsp; chapters
        </Text>
        <Divider variant="dashed" my="xs" label="Summary" />
        <Text size="sm">{manga.metadata.summary || 'No summary...'}</Text>
        <Divider variant="dashed" my="xs" label="Genres" />
        <Group spacing="xs">
          {manga.metadata.genres.map((genre) => (
            <Tooltip label={genre} key={genre}>
              <div style={{ maxWidth: 100 }}>
                <Badge color="indigo" variant="light" size="xs" fullWidth>
                  {genre}
                </Badge>
              </div>
            </Tooltip>
          ))}
        </Group>
        <Divider variant="dashed" my="xs" label="Tags" />
        <Group spacing="xs">
          {manga.metadata.tags.map((tag) => (
            <Tooltip label={tag} key={tag}>
              <div style={{ maxWidth: 100 }}>
                <Badge color="violet" variant="light" size="xs" fullWidth>
                  {tag}
                </Badge>
              </div>
            </Tooltip>
          ))}
        </Group>
      </Grid.Col>
    </Grid>
  );
}
