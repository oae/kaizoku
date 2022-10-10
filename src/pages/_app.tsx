import { AppShell, MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { NotificationsProvider } from '@mantine/notifications';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { KaizokuHeader, KaizokuLinks } from '../components/header';
import { KaizokuNavbar } from '../components/navbar';
import '../styles/globals.css';
import { trpc } from '../utils/trpc';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Kaizoku</title>
        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
      </Head>

      <MantineProvider
        withGlobalStyles
        withNormalizeCSS
        theme={{
          fontFamily: 'Inter',
          colorScheme: 'light',
        }}
      >
        <ModalsProvider>
          <NotificationsProvider position="top-center" limit={5}>
            <AppShell
              padding="md"
              navbar={<KaizokuNavbar />}
              header={<KaizokuHeader links={KaizokuLinks} />}
              styles={(theme) => ({
                main: { backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0] },
              })}
            >
              <Component {...pageProps} />
            </AppShell>
          </NotificationsProvider>
        </ModalsProvider>
      </MantineProvider>
    </>
  );
}

export default trpc.withTRPC(MyApp);
