import { Button, createStyles, Paper } from '@mantine/core';

const useStyles = createStyles((theme) => ({
  card: {
    height: 350,
    width: 210,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    backgroundSize: 'cover',
    backgroundPosition: 'center',

    transition: 'transform 150ms ease, box-shadow 150ms ease',

    '&:hover': {
      transform: 'scale(1.01)',
      boxShadow: theme.shadows.md,
    },
  },
}));

export function NewMangaCard() {
  const { classes } = useStyles();

  return (
    <Paper
      shadow="lg"
      p="md"
      radius="md"
      sx={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.9)), url('https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx53390-1RsuABC34P9D.jpg')`,
      }}
      className={classes.card}
    >
      <Button variant="filled" fullWidth color="indigo" size="xs">
        Add new
      </Button>
    </Paper>
  );
}
