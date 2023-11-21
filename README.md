# <img width="32px" src="./public/kaizoku.png" alt="Kaizoku"></img> Kaizoku

Kaizoku is self-hosted manga downloader.

![Home Page](https://i.imgur.com/KT9LrtX.png)

|                   Detail Page                   |                   Search                   |
| :---------------------------------------------: | :----------------------------------------: |
| ![Detail Page](https://i.imgur.com/uWgZ9KA.png) | ![Search](https://i.imgur.com/XP4coVD.png) |

## Deployment

You can deploy Kaizoku with following docker-compose file

```yaml
version: '3'

volumes:
  db:
  redis:

services:
  app:
    container_name: kaizoku
    image: ghcr.io/oae/kaizoku:latest
    environment:
      - DATABASE_URL=postgresql://kaizoku:kaizoku@db:5432/kaizoku
      - KAIZOKU_PORT=3000
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - PUID=<host user puid>
      - PGID=<host user guid>
      - TZ=Europe/Istanbul
    volumes:
      - <path_to_library>:/data
      - <path_to_config>:/config
      - <path_to_logs>:/logs
    depends_on:
      db:
        condition: service_healthy
    ports:
      - '3000:3000'
  redis:
    image: redis:7-alpine
    volumes:
      - redis:/data
  db:
    image: postgres:alpine
    restart: unless-stopped
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U kaizoku']
      interval: 5s
      timeout: 5s
      retries: 5
    environment:
      - POSTGRES_USER=kaizoku
      - POSTGRES_DB=kaizoku
      - POSTGRES_PASSWORD=kaizoku
    volumes:
      - db:/var/lib/postgresql/data
```

## Development

### Requirements

- node 18
- pnpm
- docker
- [mangal](https://github.com/metafates/mangal)

### Start Kaizoku

```bash
git clone https://github.com/oae/kaizoku.git
cd ./kaizoku/
cp .env.example .env
pnpm i
docker compose up -d redis db
pnpm prisma migrate deploy
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the page.

## Credits

Kaizoku uses amazing [mangal](https://github.com/metafates/mangal) by [@metafates](https://github.com/metafates) as it's downloader.
