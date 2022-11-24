import { logger } from '../../../utils/logging';
import { prisma } from '../../db/client';

interface Library {
  id: string;
}

interface Series {
  id: string;
  libraryId: string;
  name: string;
}

interface LoginResponse {
  token: string;
}

const getToken = async (baseKavitaUrl: string, username: string, password: string) => {
  const kavitaLoginUrl = new URL('/api/Account/login', baseKavitaUrl).href;
  logger.info(`login url: ${kavitaLoginUrl}`);
  const response: LoginResponse = await (
    await fetch(kavitaLoginUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        username,
        password,
      }),
    })
  ).json();

  return response.token;
};

export const scanLibrary = async () => {
  const settings = await prisma.settings.findFirstOrThrow();

  if (settings.kavitaEnabled && settings.kavitaHost && settings.kavitaUser && settings.kavitaPassword) {
    const baseKavitaUrl = settings.kavitaHost.toLowerCase().startsWith('http')
      ? settings.kavitaHost
      : `http://${settings.kavitaHost}`;

    const token = await getToken(baseKavitaUrl, settings.kavitaUser, settings.kavitaPassword);

    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    const kavitaLibrariesUrl = new URL('/api/Library', baseKavitaUrl).href;

    const libraries: Library[] = await (
      await fetch(kavitaLibrariesUrl, {
        headers,
      })
    ).json();

    await Promise.all(
      libraries.map(async (library) => {
        const kavitaLibraryUrl = new URL(`/api/Library/scan?libraryId=${library.id}&force=false`, baseKavitaUrl).href;
        await fetch(kavitaLibraryUrl, {
          method: 'POST',
          headers,
        });
      }),
    );
  }
};

export const refreshMetadata = async (mangaName: string) => {
  const settings = await prisma.settings.findFirstOrThrow();

  if (settings.kavitaEnabled && settings.kavitaHost && settings.kavitaUser && settings.kavitaPassword) {
    const baseKavitaUrl = settings.kavitaHost.toLowerCase().startsWith('http')
      ? settings.kavitaHost
      : `http://${settings.kavitaHost}`;

    const token = await getToken(baseKavitaUrl, settings.kavitaUser, settings.kavitaPassword);

    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    const kavitaSeriesUrl = new URL('/api/Series', baseKavitaUrl).href;

    const series: Series[] = await (
      await fetch(kavitaSeriesUrl, {
        method: 'POST',
        body: JSON.stringify({}),
        headers,
      })
    ).json();

    const content = series.find((c) => c.name === mangaName);

    if (!content) {
      return;
    }

    const kavitaSeriesRefreshUrl = new URL(`/api/Series/scan`, baseKavitaUrl).href;
    await fetch(kavitaSeriesRefreshUrl, {
      method: 'POST',
      body: JSON.stringify({
        libraryId: content.libraryId,
        seriesId: content.id,
        forceUpdate: true,
      }),
      headers,
    });
  }
};
