/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
const env = (await import("./src/env.js")).env;

/** @type {import("next").NextConfig} */
const config = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.gravatar.com",
        port: "",
        pathname: "/avatar/**",
      },
      {
        protocol: env.SUWAYOMI_PROTOCOL,
        hostname: env.SUWAYOMI_HOST,
        port: env.SUWAYOMI_PORT,
        pathname: `/api/v1/**`,
      },
    ],
  },
};

export default config;
