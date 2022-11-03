import { AppShell, ColorScheme, ColorSchemeProvider, MantineProvider } from '@mantine/core';
import { useColorScheme, useHotkeys } from '@mantine/hooks';
import { ModalsProvider } from '@mantine/modals';
import { NotificationsProvider } from '@mantine/notifications';
import { getCookie, setCookie } from 'cookies-next';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import { KaizokuHeader } from '../components/header';
import { KaizokuNavbar } from '../components/navbar';
import '../styles/globals.css';
import { trpc } from '../utils/trpc';

function MyApp(props: AppProps) {
  const { Component, pageProps } = props;
  const preferredColorScheme = useColorScheme();
  const [colorScheme, setColorScheme] = useState<ColorScheme>('light');
  useEffect(() => {
    let followSystem = getCookie('follow-system');
    if (followSystem === undefined) {
      followSystem = true;
      setCookie('follow-system', '1');
    }
    if (followSystem === '1') {
      setColorScheme(preferredColorScheme);
    } else {
      setColorScheme((getCookie('mantine-color-scheme') as ColorScheme) || preferredColorScheme);
    }
  }, [preferredColorScheme]);
  const toggleColorScheme = (value?: ColorScheme) => {
    const nextColorScheme = value || (colorScheme === 'dark' ? 'light' : 'dark');
    setColorScheme(nextColorScheme);
    setCookie('mantine-color-scheme', nextColorScheme, { maxAge: 60 * 60 * 24 * 30 });
  };

  useHotkeys([['shift+t', () => toggleColorScheme()]]);

  return (
    <>
      <Head>
        <title>Kaizoku</title>
        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
      </Head>

      <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
        <MantineProvider
          withGlobalStyles
          withNormalizeCSS
          theme={{
            fontFamily: 'Inter',
            colorScheme,
          }}
        >
          <ModalsProvider>
            <NotificationsProvider position="top-center" limit={5}>
              <AppShell
                padding="md"
                navbar={<KaizokuNavbar />}
                header={<KaizokuHeader />}
                styles={(theme) => ({
                  main: { backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0] },
                })}
              >
                <Component {...pageProps} />
              </AppShell>
            </NotificationsProvider>
          </ModalsProvider>
        </MantineProvider>
      </ColorSchemeProvider>
    </>
  );
}

export default trpc.withTRPC(MyApp);
