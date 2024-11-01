import models from '../models/index.js';
import { Telegraf } from 'telegraf';
import dotenv from 'dotenv';
dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN);

// Start listening to messages
bot.start((ctx) => ctx.reply('Welcome! This bot is live!'));
bot.hears('hi', (ctx) => {
    console.log('bot.hears triggered');
    ctx.reply('Hello!')
});

bot.on('text', (ctx) => {
    console.log(`Received message: ${ctx.message.text}`);
    console.log(ctx.message.from.id);
    ctx.reply('Message received'); 
  
  });
 
// Export the bot
export default bot;
