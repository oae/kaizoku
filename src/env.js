import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    DATABASE_URL: z.string().url(),
    SUWAYOMI_PROTOCOL: z.enum(["http", "https"]).default("http"),
    SUWAYOMI_HOST: z.string().default("localhost"),
    SUWAYOMI_PORT: z.string().default("4567"),
    SUWAYOMI_URL: z.string().url().default("http://localhost:4567"),
    SUWAYOMI_API: z.string().default("http://localhost:4567/api/v1"),
    UNSUPPORTED_SOURCES: z.string().transform((string) => string.split(",")),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    // NEXT_PUBLIC_CLIENTVAR: z.string(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    UNSUPPORTED_SOURCES: process.env.UNSUPPORTED_SOURCES,
    SUWAYOMI_PROTOCOL: process.env.SUWAYOMI_PROTOCOL,
    SUWAYOMI_HOST: process.env.SUWAYOMI_HOST,
    SUWAYOMI_PORT: process.env.SUWAYOMI_PORT,
    SUWAYOMI_URL: process.env.SUWAYOMI_URL,
    SUWAYOMI_API: process.env.SUWAYOMI_API,
    // NEXT_PUBLIC_CLIENTVAR: process.env.NEXT_PUBLIC_CLIENTVAR,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});
