import path from 'path';
import pino from 'pino';

export const logger = pino({
  level: 'debug',
  transport: {
    targets: [
      {
        target: 'pino-pretty',
        level: 'debug',
        options: {
          levelFirst: false,
          destination: 1,
          translateTime: true,
          colorize: true,
        },
      },
      {
        target: 'pino/file',
        level: 'debug',
        options: {
          destination: path.resolve(
            process.cwd(),
            path.relative(process.cwd(), path.resolve(process.env.KAIZOKU_LOG_PATH || '', 'manup.log')),
          ),
        },
      },
    ],
  },
});
