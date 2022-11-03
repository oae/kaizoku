import { Box, Container, createStyles, Group, Header, Title, UnstyledButton } from '@mantine/core';
import Image from 'next/image';
import Link from 'next/link';
import { SearchControl } from './headerSearch';
import { SettingsMenuButton } from './settingsMenu';

const useStyles = createStyles((theme) => ({
  header: {
    backgroundColor: theme.colors.red[8],
    borderBottom: 0,
    boxShadow: theme.shadows.md,
  },

  inner: {
    height: '56px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  title: {
    fontFamily: 'Ninja Naruto Regular, Inter',
    lineHeight: '56px',
    fontWeight: 300,
    marginTop: '10px',
    color: theme.colors.gray[0],
  },
}));

export function KaizokuHeader() {
  const { classes } = useStyles();

  return (
    <Header height={56} className={classes.header} mb={120}>
      <Container fluid>
        <Box className={classes.inner}>
          <Link href="/">
            <UnstyledButton component="a">
              <Group spacing={10}>
                <Image alt="header" src="/kaizoku.png" height={48} width={48} />
                <Title order={2} className={classes.title}>
                  Kaizoku
                </Title>
              </Group>
            </UnstyledButton>
          </Link>

          <Group position="center" spacing={5}>
            <SearchControl />
            <SettingsMenuButton />
          </Group>
        </Box>
      </Container>
    </Header>
  );
}
