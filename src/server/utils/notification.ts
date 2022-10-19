import TelegramBot from 'node-telegram-bot-api';

const token = '***REMOVED***';
const chatId = '***REMOVED***';
const bot = new TelegramBot(token);

export const sendNotification = async (title: string, body: string, url?: string) => {
  const message = `
<b>${title}</b>

${body}

${url || ''}
  `;
  await bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
};
