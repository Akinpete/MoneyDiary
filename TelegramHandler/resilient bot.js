import { Telegraf } from 'telegraf';
import dotenv from 'dotenv';
import models from '../models/index.js';

dotenv.config();

// Bot configuration
const config = {
    // Number of reconnection attempts
    reconnectionAttempts: 3,
    // Delay between reconnection attempts (in ms)
    reconnectionDelay: 5000,
    // Polling timeout (in seconds)
    pollingTimeout: 30
};

const createBot = () => {
    const bot = new Telegraf(process.env.BOT_TOKEN);

    // Error handler for bot errors
    bot.catch((err, ctx) => {
        console.error(`Error for ${ctx.updateType}:`, err);
        // Attempt to notify user of error if possible
        if (ctx.chat) {
            ctx.reply('Sorry, there was an error processing your message.')
                .catch(e => console.error('Failed to send error message:', e));
        }
    });

    // Start command handler
    bot.start((ctx) => ctx.reply('Welcome! This bot is live!'));

    // Message handlers
    bot.hears('hi', (ctx) => {
        console.log('bot.hears triggered');
        ctx.reply('Hello!')
            .catch(err => console.error('Failed to send hello message:', err));
    });

    bot.on('text', (ctx) => {
        console.log(`Received message: ${ctx.message.text}`);
        console.log(ctx.message.from.id);
        ctx.reply('Message received')
            .catch(err => console.error('Failed to send receipt message:', err));
    });

    // Launch bot with auto-reconnection
    const launchBot = async () => {
        let attempts = 0;
        
        while (attempts < config.reconnectionAttempts) {
            try {
                await bot.launch({
                    polling: {
                        timeout: config.pollingTimeout
                    }
                });
                
                console.log('Bot successfully launched');
                
                // Reset attempts on successful connection
                attempts = 0;
                break;
            } catch (error) {
                attempts++;
                console.error(`Failed to launch bot (attempt ${attempts}):`, error);
                
                if (attempts === config.reconnectionAttempts) {
                    console.error('Max reconnection attempts reached. Please check your connection and bot token.');
                    throw error;
                }
                
                // Wait before retrying
                await new Promise(resolve => setTimeout(resolve, config.reconnectionDelay));
            }
        }
    };

    // Handle graceful shutdown
    process.once('SIGINT', () => bot.stop('SIGINT'));
    process.once('SIGTERM', () => bot.stop('SIGTERM'));

    // Add restart method to bot
    bot.restart = async () => {
        try {
            console.log('Attempting to restart bot...');
            await bot.stop();
            await launchBot();
            console.log('Bot successfully restarted');
        } catch (error) {
            console.error('Failed to restart bot:', error);
            throw error;
        }
    };

    // Launch the bot initially
    launchBot().catch(error => {
        console.error('Failed to start bot:', error);
        process.exit(1);
    });

    return bot;
};

const bot = createBot();

// Error handlers for uncaught errors
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    // Attempt to restart bot
    bot.restart().catch(() => process.exit(1));
});

process.on('unhandledRejection', (error) => {
    console.error('Unhandled Rejection:', error);
    // Attempt to restart bot
    bot.restart().catch(() => process.exit(1));
});

export default bot;