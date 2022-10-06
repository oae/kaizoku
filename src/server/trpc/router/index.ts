import { t } from '../trpc';

import { libraryRouter } from './library';
import { mangaRouter } from './manga';

export const appRouter = t.router({
  library: libraryRouter,
  manga: mangaRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
