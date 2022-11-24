import * as komga from './komga';
import * as kavita from './kavita';

export const scanLibrary = async () => {
  await Promise.all([komga.scanLibrary(), kavita.scanLibrary()]);
};

export const refreshMetadata = async (mangaTitle: string) => {
  await Promise.all([komga.refreshMetadata(mangaTitle), kavita.refreshMetadata(mangaTitle)]);
};
