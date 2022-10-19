import TelegramBot from 'node-telegram-bot-api';

const token = process.env.TELEGRAM_TOKEN || '';
const chatId = process.env.TELEGRAM_CHAT_ID || '';
const disableNotification = !!parseInt(process.env.TELEGRAM_SEND_SILENTLY || '0', 10);
const bot = new TelegramBot(token);

export const sendNotification = async (title: string, body: string, url?: string) => {
  if (!token || !chatId) {
    return;
  }

  const message = `
<b>${title}</b>

${body}

${url || ''}
  `;
  await bot.sendMessage(chatId, message, { parse_mode: 'HTML', disable_notification: disableNotification });
};
