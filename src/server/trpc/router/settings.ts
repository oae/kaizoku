import { z } from 'zod';
import { getMangalConfig, setMangalConfig } from '../../utils/mangal';
import { t } from '../trpc';

export const settingsRouter = t.router({
  query: t.procedure.query(async ({ ctx }) => {
    const mangalConfig = (await getMangalConfig()).sort((a, b) => a.key.localeCompare(b.key));
    const appConfig = await ctx.prisma.settings.findFirstOrThrow();
    return {
      mangalConfig,
      appConfig,
    };
  }),
  update: t.procedure
    .input(
      z.object({
        key: z.string().min(1),
        value: z.string().or(z.boolean()).or(z.number()).or(z.string().array()),
        updateType: z.literal('mangal').or(z.literal('app')),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { key, value, updateType } = input;
      if (updateType === 'mangal') {
        await setMangalConfig(key, value);
      } else if (updateType === 'app') {
        const appConfig = await ctx.prisma.settings.findFirstOrThrow();
        await ctx.prisma.settings.update({
          where: {
            id: appConfig.id,
          },
          data: {
            [key]: value,
          },
        });
      }
    }),
});
