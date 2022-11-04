import TelegramBot from 'node-telegram-bot-api';
import { prisma } from '../db/client';

export const sendNotification = async (title: string, body: string, url?: string) => {
  const settings = await prisma.settings.findFirstOrThrow();

  if (settings.telegramEnabled && settings.telegramChatId && settings.telegramToken) {
    const bot = new TelegramBot(settings.telegramToken);
    const message = `
<b>${title}</b>

${body}

${url || ''}
    `;
    await bot.sendMessage(settings.telegramChatId, message, {
      parse_mode: 'HTML',
      disable_notification: settings.telegramSendSilently,
    });
  }

  if (settings.appriseEnabled && settings.appriseHost && settings.appriseUrls.length !== 0) {
    const appriseServiceUrl = new URL(
      '/notify',
      settings.appriseHost.toLowerCase().startsWith('http') ? settings.appriseHost : `http://${settings.appriseHost}`,
    ).href;
    await fetch(appriseServiceUrl, {
      body: JSON.stringify({
        urls: settings.appriseUrls,
        title,
        body: `${body} ${url}`,
        format: 'html',
      }),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    });
  }
};
