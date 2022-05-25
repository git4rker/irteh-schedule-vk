const VkBot = require('node-vk-bot-api');
const config = require('./config.json');

const bot = new VkBot(config.vk.token);

bot.command('/start', (ctx) => {
  ctx.reply('Hello!');
});

bot.startPolling();
