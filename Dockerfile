##### DEPENDENCIES

FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# Install Prisma Client - remove if not using Prisma

COPY prisma ./

# Install dependencies based on the preferred package manager

COPY package.json yarn.lock ./

RUN yarn --frozen-lockfile

##### BUILDER

FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

RUN yarn build

##### RUNNER

FROM node:18-alpine AS runner

WORKDIR /tmp

RUN wget https://github.com/metafates/mangal/releases/download/v3.12.0/mangal_3.12.0_Linux_x86_64.tar.gz && \
  tar xf mangal_3.12.0_Linux_x86_64.tar.gz && \
  mv mangal /usr/bin/mangal && \
  chmod +x /usr/bin/mangal

WORKDIR /app

ENV NODE_ENV production

ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/next.config.mjs ./
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json

COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/mangal /home/nextjs/.config/mangal/sources

RUN mkdir /data
RUN chown -R nextjs:nodejs /app
RUN chown -R nextjs:nodejs /data

USER nextjs
EXPOSE 3000
ENV PORT 3000
ENV MANGAL_METADATA_COMIC_INFO_XML=true
ENV MANGAL_METADATA_FETCH_ANILIST=true
ENV MANGAL_METADATA_SERIES_JSON=true
ENV MANGAL_FORMATS_USE=cbz
ENV MANGAL_DOWNLOADER_DOWNLOAD_COVER=true
ENV MANGAL_DOWNLOADER_REDOWNLOAD_EXISTING=true

CMD ["yarn", "prod"]
