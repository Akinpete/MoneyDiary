import { Telegraf, Markup } from 'telegraf';
import dotenv from 'dotenv';
import models from '../models/index.js';
import https from 'https';

dotenv.config();

class BotInstance {
    constructor() {
        this.createBot();
    }

    createBot() {
        // Create custom agent with timeout handling
        const agent = new https.Agent({
            keepAlive: true,
            timeout: 30000, // 30 seconds
            keepAliveMsecs: 10000
        });

        this.bot = new Telegraf(process.env.BOT_TOKEN, {
            telegram: {
                // Adding timeout options and custom agent
                timeout: 30000,
                agent: agent,
                apiRoot: 'https://api.telegram.org'
            }
        });

        this.setupHandlers();
    }

    setupHandlers() {
        // this.bot.start((ctx) => ctx.reply('Welcome! This bot is live!'));
        this.bot.start((ctx) => {
            ctx.replyWithMarkdown(
             `🍌 * Your trusted companion for managing finances:*Simplify your money tracking with MoneyDiary. Log expenses, analyze spending, and stay on top of your finances in real-time.`,
             Markup.inlineKeyboard([               
               [Markup.button.url('💬 Official Channel', 'https://t.me/+lrHULPUINwA1ZDE0')],
            //    [Markup.button.url('🎉 Announcement Channel', 'https://example.com/announcement-channel')],
               [Markup.button.url('🌐 Website', 'https://akin-pete.tech')],
             ])
           );
        });

        this.bot.hears('hi', (ctx) => {
            console.log('bot.hears triggered');
            ctx.reply('Hello!')
                .catch(this.handleError.bind(this));
        });

        this.bot.on('text', (ctx) => {
            console.log(`Received message: ${ctx.message.text}`);
            console.log(ctx.message.from.id);
            ctx.reply('Message received')
                .catch(this.handleError.bind(this));
        });

        // Add error handler
        this.bot.catch(this.handleError.bind(this));
    }

    async handleError(error, ctx) {
        console.error('Bot error occurred:', error);

        if (error.code === 'ETIMEDOUT' || error.code === 'ECONNRESET') {
            console.log('Connection timeout detected, attempting to reset connection...');
            try {
                await this.resetConnection();
            } catch (e) {
                console.error('Failed to reset connection:', e);
            }
        }

        // Try to notify user if context exists
        if (ctx && ctx.chat) {
            try {
                await ctx.reply('An error occurred. Retrying...')
                    .catch(e => console.error('Failed to send error message:', e));
            } catch (e) {
                console.error('Failed to send error message:', e);
            }
        }
    }

    async resetConnection() {
        try {
            console.log('Stopping bot...');
            await this.bot.stop();
            
            // Clear any existing connections
            if (this.bot.telegram.options.agent) {
                this.bot.telegram.options.agent.destroy();
            }

            // Wait a bit before recreating
            await new Promise(resolve => setTimeout(resolve, 5000));

            // Create fresh bot instance
            console.log('Creating new bot instance...');
            this.createBot();

            // Launch new instance
            await this.launchWithRetry();
            console.log('Bot connection reset successfully');
        } catch (error) {
            console.error('Error during connection reset:', error);
            throw error;
        }
    }

    async launchWithRetry(attempts = 3, delay = 5000) {
        for (let i = 0; i < attempts; i++) {
            try {
                await this.bot.launch({
                    dropPendingUpdates: true, // Important: clear any pending updates
                    polling: {
                        timeout: 30,
                        limit: 100,
                    }
                });
                console.log('Bot successfully launched');
                return;
            } catch (error) {
                console.error(`Failed to launch bot (attempt ${i + 1}):`, error);
                
                if (i === attempts - 1) {
                    throw error;
                }
                
                if (error.code === 'ETIMEDOUT') {
                    await this.resetConnection();
                }
                
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }

    async restart() {
        try {
            console.log('Attempting to restart bot...');
            await this.resetConnection();
            console.log('Bot successfully restarted');
        } catch (error) {
            console.error('Failed to restart bot:', error);
            throw error;
        }
    }

    stop(reason) {
        return this.bot.stop(reason);
    }
}

// Create single instance
const botInstance = new BotInstance();

// Export the bot instance
export default botInstance;