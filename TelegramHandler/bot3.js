import { Telegraf, Markup } from 'telegraf';
import dotenv from 'dotenv';

dotenv.config();


class BotInstance {
  token = process.env.BOT_TOKEN;
  constructor(token, options = {}) {
    this.token = token;
    this.maxRetries = options.maxRetries || 5;
    this.retryDelay = options.retryDelay || 5000;
    this.bot = null;
    this.isRunning = false;
    this.currentRetry = 0;
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
}

  async initialize() {
    this.bot = new Telegraf(this.token);
    
    // Setup error handlers
    this.bot.catch((err) => {
      console.error('Bot error:', err);
      this.handleError(err);
    });
    this.setupHandlers();

  }

  async handleError(error) {
    console.error(`Bot encountered an error: ${error.message}`);
    
    if (this.isRunning) {
      await this.resetConnection();
    }
  }

  async resetConnection() {
    try {
      console.log('Attempting to reset connection...');
      
      if (this.bot && this.isRunning) {
        try {
          await this.bot.stop();
          this.isRunning = false;
        } catch (err) {
          console.warn('Error while stopping bot:', err.message);
        }
      }

      await this.initialize();
      await this.launchWithRetry();
    } catch (err) {
      console.error('Error during connection reset:', err);
      throw err;
    }
  }

  async verifyConnection() {
    try {
      // Get bot info first to verify connection
      this.bot.botInfo = await this.bot.telegram.getMe();
      return true;
    } catch (err) {
      console.error('Failed to verify bot connection:', err);
      return false;
    }
  }

  async launch() {
    try {
      // First verify we can connect
      if (!await this.verifyConnection()) {
        throw new Error('Failed to verify bot connection');
      }

      // Launch the bot without awaiting (new behavior in 4.11+)
      this.bot.launch({
        allowedUpdates: ['message', 'callback_query'],
        dropPendingUpdates: true
      }).catch(err => {
        console.error('Long polling error:', err);
        this.handleError(err);
      });
      
      this.isRunning = true;
      this.currentRetry = 0;
      console.log('Bot successfully launched');

      // Setup graceful shutdown
      process.once('SIGINT', () => this.shutdown('SIGINT'));
      process.once('SIGTERM', () => this.shutdown('SIGTERM'));
      
    } catch (err) {
      throw err;
    }
  }

  async launchWithRetry() {
    while (this.currentRetry < this.maxRetries) {
      try {
        this.currentRetry++;
        console.log(`Attempting to launch bot (attempt ${this.currentRetry})`);
        
        await this.launch();
        return;
        
      } catch (err) {
        console.error(`Failed to launch bot (attempt ${this.currentRetry}):`, err);
        
        if (this.currentRetry === this.maxRetries) {
          throw new Error(`Failed to start bot after ${this.maxRetries} attempts`);
        }
        
        await new Promise(resolve => setTimeout(resolve, this.retryDelay));
      }
    }
  }

  async shutdown(signal) {
    console.log(`Received ${signal} signal`);
    try {
      if (this.bot && this.isRunning) {
        await this.bot.stop();
        this.isRunning = false;
        console.log('Bot stopped gracefully');
      }
    } catch (err) {
      console.error('Error during shutdown:', err);
      process.exit(1);
    }
    process.exit(0);
  }

  async isHealthy() {
    try {
      if (!this.bot || !this.isRunning) return false;
      await this.bot.telegram.getMe();
      return true;
    } catch (err) {
      return false;
    }
  }
}

export default BotInstance;