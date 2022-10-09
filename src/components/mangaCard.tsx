import { Badge, Button, createStyles, Paper, Title } from '@mantine/core';
import { IconExternalLink } from '@tabler/icons';

const useStyles = createStyles((theme) => ({
  card: {
    height: 350,
    width: 210,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    backgroundSize: 'cover',
    backgroundPosition: 'center',

    transition: 'transform 150ms ease, box-shadow 150ms ease',

    '&:hover': {
      transform: 'scale(1.01)',
      boxShadow: theme.shadows.md,
    },
  },

  title: {
    fontFamily: `${theme.fontFamily}`,
    fontWeight: 900,
    color: theme.white,
    lineHeight: 1.2,
    marginTop: theme.spacing.xs,
  },

  category: {
    textTransform: 'uppercase',
  },
}));

interface ArticleCardImageProps {
  image: string;
  title: string;
  category?: string;
}

export function MangaCard({ image, title, category }: ArticleCardImageProps) {
  const { classes } = useStyles();

  return (
    <Paper
      shadow="lg"
      p="md"
      radius="md"
      sx={{ backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.5)), url(${image})` }}
      className={classes.card}
    >
      <div>
        {category && (
          <Badge color="teal" variant="filled" className={classes.category} size="md">
            {category}
          </Badge>
        )}
        <Title order={3} className={classes.title}>
          {title}
        </Title>
      </div>
      <Button leftIcon={<IconExternalLink size={16} />} variant="filled" color="indigo" size="xs">
        Read
      </Button>
    </Paper>
  );
}

MangaCard.defaultProps = {
  category: '',
};
