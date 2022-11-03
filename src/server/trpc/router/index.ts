import { t } from '../trpc';

import { libraryRouter } from './library';
import { mangaRouter } from './manga';
import { settingsRouter } from './settings';

export const appRouter = t.router({
  library: libraryRouter,
  manga: mangaRouter,
  settings: settingsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
