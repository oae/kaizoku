import { Center, Container, createStyles, Group, Header, Menu, Title, UnstyledButton } from '@mantine/core';
import { NextLink } from '@mantine/next';
import Image from 'next/image';
import Link from 'next/link';
import { AiOutlineDown } from 'react-icons/ai';

const useStyles = createStyles((theme) => ({
  header: {
    backgroundColor: theme.colors.red[8],
    borderBottom: 0,
    boxShadow: theme.shadows.xl,
  },

  inner: {
    height: '56px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  title: {
    fontFamily: 'Ninja Naruto Regular',
    lineHeight: '56px',
    fontWeight: 300,
    marginTop: '10px',
    color: theme.colors.gray[0],
  },

  links: {},

  link: {
    display: 'block',
    lineHeight: 1,
    padding: '8px 12px',
    borderRadius: theme.radius.sm,
    textDecoration: 'none',
    color: theme.white,
    fontSize: theme.fontSizes.sm,
    fontWeight: 500,

    '&:hover': {
      backgroundColor: theme.fn.lighten(theme.colors.red[8], 0.2),
    },
  },

  linkLabel: {
    marginRight: 5,
  },
}));

interface HeaderSearchProps {
  links: { link: string; label: string; links?: { link: string; label: string }[] }[];
}

export function KaizokuHeader({ links }: HeaderSearchProps) {
  const { classes } = useStyles();

  const items = links.map((link) => {
    const menuItems = link.links?.map((item) => <Menu.Item key={item.link}>{item.label}</Menu.Item>);

    if (menuItems) {
      return (
        <Menu key={link.label} trigger="hover" exitTransitionDuration={0}>
          <Menu.Target>
            <a href={link.link} className={classes.link} onClick={(event) => event.preventDefault()}>
              <Center>
                <span className={classes.linkLabel}>{link.label}</span>
                <AiOutlineDown size={12} strokeWidth={1.5} />
              </Center>
            </a>
          </Menu.Target>
          <Menu.Dropdown>{menuItems}</Menu.Dropdown>
        </Menu>
      );
    }

    return (
      <NextLink target="_blank" key={link.label} href={link.link} className={classes.link}>
        {link.label}
      </NextLink>
    );
  });

  return (
    <Header height={56} className={classes.header} mb={120}>
      <Container fluid>
        <div className={classes.inner}>
          <Link href="/">
            <UnstyledButton component="a">
              <Group spacing={10}>
                <Image src="/kaizoku.png" height={48} width={48} />
                <Title order={2} className={classes.title}>
                  Kaizoku
                </Title>
              </Group>
            </UnstyledButton>
          </Link>
          <Group spacing={5} className={classes.links}>
            {items}
          </Group>
        </div>
      </Container>
    </Header>
  );
}

export const KaizokuLinks = [
  {
    link: '/admin/queues/queue/downloadQue?status=completed',
    label: 'Downloads',
  },
  {
    link: '/',
    label: 'Settings',
  },
];
