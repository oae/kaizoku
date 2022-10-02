/* eslint-disable react/jsx-props-no-spreading */
import { EuiProvider } from '@elastic/eui';
import '@elastic/eui/dist/eui_theme_light.css';
import type { AppProps } from 'next/app';
import NoSSR from 'react-no-ssr';
import '../styles/globals.css';
import { trpc } from '../utils/trpc';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <NoSSR>
      <EuiProvider colorMode="LIGHT">
        <Component {...pageProps} />
      </EuiProvider>
    </NoSSR>
  );
}

export default trpc.withTRPC(MyApp);
