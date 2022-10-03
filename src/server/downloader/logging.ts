import path from 'path';
import pino from 'pino';

export const logger = pino({
  level: 'debug',
  transport: {
    targets: [
      {
        target: 'pino-pretty',
        level: 'info',
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
          destination: path.resolve(process.cwd(), 'manup.log'),
        },
      },
    ],
  },
});
