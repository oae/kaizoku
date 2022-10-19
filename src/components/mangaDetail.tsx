import { Badge, createStyles, Divider, Grid, Group, Image, Spoiler, Text, Title } from '@mantine/core';
import { NextLink } from '@mantine/next';
import { Prisma } from '@prisma/client';
import { contrastColor } from 'contrast-color';
import stc from 'string-to-color';
import { IconExternalLink } from '@tabler/icons';

const useStyles = createStyles((theme) => ({
  root: {
    wordBreak: 'break-word',
  },
  outsideLink: {
    textDecoration: 'none',
    fontWeight: 600,
    color: theme.colors.blue[7],
    '&:hover': {
      color: theme.colors.indigo[7],
    },
    fontSize: 24,
  },
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
    <Spoiler
      maxHeight={460}
      styles={{
        control: {
          width: '100%',
          textDecoration: 'none !important',
          fontWeight: 'bolder',
        },
      }}
      showLabel={<Divider labelPosition="center" size="sm" variant="solid" label="Show More" />}
      hideLabel={<Divider labelPosition="center" size="sm" variant="solid" label="Hide" />}
    >
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
          <Divider
            mb="xs"
            labelPosition="left"
            label={
              manga.metadata.urls.find((url) => url.includes('anilist')) ? (
                <NextLink
                  target="_blank"
                  className={classes.outsideLink}
                  href={manga.metadata.urls.find((url) => url.includes('anilist')) || '#'}
                >
                  <Text mr={5} inline component="span">
                    {manga.title}
                  </Text>
                  <IconExternalLink size={18} />
                </NextLink>
              ) : (
                <Title sx={{ fontSize: 24 }} order={3}>
                  {manga.title}
                </Title>
              )
            }
          />
          <Group spacing={0}>
            {manga.metadata.synonyms.map((synonym) => (
              <Badge key={synonym} color="gray" variant="filled" size="xs" m={2}>
                {synonym}
              </Badge>
            ))}
          </Group>
          <Divider sx={{ fontWeight: 'bolder' }} variant="dashed" my="xs" label="Download" />
          <Group
            spacing={5}
            sx={(theme) => ({
              fontSize: theme.fontSizes.xs,
            })}
          >
            Checking{' '}
            <Badge
              component="span"
              color="cyan"
              variant="filled"
              size="xs"
              sx={{ backgroundColor: stc(manga.interval), color: contrastColor({ bgColor: stc(manga.interval) }) }}
            >
              {manga.interval}
            </Badge>{' '}
            from{' '}
            <Badge
              component="span"
              color="cyan"
              variant="filled"
              size="xs"
              sx={{ backgroundColor: stc(manga.source), color: contrastColor({ bgColor: stc(manga.source) }) }}
            >
              {manga.source}
            </Badge>
          </Group>
          <Divider sx={{ fontWeight: 'bolder' }} variant="dashed" my="xs" label="Status" />
          <Badge color="cyan" variant="filled" size="sm">
            {manga.metadata.status}
          </Badge>

          <Divider sx={{ fontWeight: 'bolder' }} variant="dashed" my="xs" label="Summary" />
          <Text size="xs">{manga.metadata.summary || 'No summary...'}</Text>
          <Divider sx={{ fontWeight: 'bolder' }} variant="dashed" my="xs" label="Genres" />
          <Group spacing={0}>
            {manga.metadata.genres.map((genre) => (
              <Badge key={genre} color="indigo" variant="light" size="xs" m={2}>
                {genre}
              </Badge>
            ))}
          </Group>
          <Divider sx={{ fontWeight: 'bolder' }} variant="dashed" my="xs" label="Tags" />
          <Group spacing={0}>
            {manga.metadata.tags.map((tag) => (
              <Badge key={tag} color="violet" variant="light" size="xs" m={2}>
                {tag}
              </Badge>
            ))}
          </Group>
        </Grid.Col>
      </Grid>
    </Spoiler>
  );
}
