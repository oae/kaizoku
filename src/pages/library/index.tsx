import { Grid } from '@mantine/core';
import { MangaCard } from '../../components/mangaCard';

export default function LibraryPage() {
  return (
    <Grid justify="center">
      {Array.from(Array(92)).map(() => {
        return (
          <Grid.Col span="content">
            <MangaCard
              category="Completed"
              title="Attack on Titan"
              image="https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx53390-1RsuABC34P9D.jpg"
            />
          </Grid.Col>
        );
      })}
    </Grid>
  );
}
