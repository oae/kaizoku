import TelegramBot from 'node-telegram-bot-api';

const token = '***REMOVED***';
const chatId = '***REMOVED***';
const bot = new TelegramBot(token);

export const sendNotification = async (message: string) => {
  await bot.sendMessage(chatId, message);
};
