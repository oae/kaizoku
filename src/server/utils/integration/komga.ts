import { sanitizer } from '../../../utils';
import { prisma } from '../../db/client';

interface Library {
  name: string;
  id: string;
}

interface Series {
  content: SeriesContent[];
}

interface SeriesContent {
  id: string;
  name: string;
}

export const scanLibrary = async () => {
  const settings = await prisma.settings.findFirstOrThrow();

  if (settings.komgaEnabled && settings.komgaHost && settings.komgaUser && settings.komgaPassword) {
    const baseKomgaUrl = settings.komgaHost.toLowerCase().startsWith('http')
      ? settings.komgaHost
      : `http://${settings.komgaHost}`;
    const headers = {
      Authorization: `Basic ${Buffer.from(`${settings.komgaUser}:${settings.komgaPassword}`).toString('base64')}`,
    };
    const komgaLibrariesUrl = new URL('/api/v1/libraries', baseKomgaUrl).href;

    const libraries: Library[] = await (
      await fetch(komgaLibrariesUrl, {
        headers,
      })
    ).json();

    const includedLibraries = settings.komgaLibraries;

    await Promise.all(
      libraries
        .filter((library) => (includedLibraries.length > 0 ? includedLibraries.includes(library.name) : library.name))
        .map(async (library) => {
          const komgaLibraryUrl = new URL(`/api/v1/libraries/${library.id}/scan`, baseKomgaUrl).href;
          await fetch(komgaLibraryUrl, {
            method: 'POST',
            headers,
          });
        }),
    );
  }
};

export const refreshMetadata = async (mangaName: string) => {
  const settings = await prisma.settings.findFirstOrThrow();

  if (settings.komgaEnabled && settings.komgaHost && settings.komgaUser && settings.komgaPassword) {
    const baseKomgaUrl = settings.komgaHost.toLowerCase().startsWith('http')
      ? settings.komgaHost
      : `http://${settings.komgaHost}`;
    const headers = {
      Authorization: `Basic ${Buffer.from(`${settings.komgaUser}:${settings.komgaPassword}`).toString('base64')}`,
    };
    const komgaSeriesUrl = new URL('/api/v1/series?unpaged=true', baseKomgaUrl).href;

    const series: Series = await (
      await fetch(komgaSeriesUrl, {
        headers,
      })
    ).json();

    const content = series.content.find((c) => c.name === sanitizer(mangaName));

    if (!content) {
      return;
    }

    const komgaSeriesRefreshUrl = new URL(`/api/v1/series/${content.id}/metadata/refresh`, baseKomgaUrl).href;
    await fetch(komgaSeriesRefreshUrl, {
      method: 'POST',
      headers,
    });
  }
};
