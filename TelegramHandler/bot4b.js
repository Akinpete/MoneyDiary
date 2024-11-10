import { Telegraf, Markup } from 'telegraf';
import dotenv from 'dotenv';
import models from '../models/index.js';
import * as transactionLoggerComposer from './tgcomposer.js';
import runcheck from '../utils/transactions_helper.js';

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
      this.authedUsers = new Set();
    //   this.not_authedUsers = new Set();
    }

    async checkAuth(telegram_id) {
        if (this.authedUsers.has(telegram_id)) {
            return true;
        }
        // if (this.not_authedUsers.has(telegram_id)) {
        //     return false;
        // }

        try {
            let user = await models.User.findOne({ where: { telegram_id: telegram_id } });
            if (user) {
                console.log('FOUND!')
                this.authedUsers.add(telegram_id);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error checking user in db', error);
            return false;
        }
    }

    async requireAuth(ctx, next) {
        const telegram_id = ctx.from?.id;
        console.log(`TG ID: ${telegram_id}`);
        if (!telegram_id) return;

        const isAuthed = await this.checkAuth(telegram_id);
        if (!isAuthed) {
            return ctx.replyWithMarkdown(
                `You're not registered on the Platform`,
                Markup.inlineKeyboard([
                    [Markup.button.url('💬 Click to Register', 'https://cardinal-advanced-buffalo.ngrok-free.app')]
                ])
            );
        }
        return next();
    }

    async isvalidLog(ctx, text, next) {
        // const telegram_id = ctx.from?.id;
        const response = await runcheck(text);
        if (!response) {
            return ctx.replyWithMarkdown(
                `Invalid Input`,
                Markup.inlineKeyboard([
                    [Markup.button.command('💬 Please Try Again', 'logtransaction')]
                ])
            );
        }
        return next();

    }



    setupHandlers() {
        let transaction_text;
        let cpyUser_categories;
        this.bot.start(
            async (ctx, next) => await this.requireAuth(ctx, next),
            async(ctx) => {
                await ctx.replyWithMarkdown(
                    `🚀 Money Diary - AI Financial Assistant
                    💸 *Your trusted companion for managing finances:*
                    implify your money tracking with MoneyDiary. Log expenses, analyze spending, and stay on top of your finances in real-time.`,
                    Markup.inlineKeyboard([
                        [Markup.button.url('💬 Official Channel', 'https://t.me/+IrHULPUINwA1ZDE0')],
                        [Markup.button.url('🌐 Website', 'https://akin-pete.tech')]
                    ])
                );
            }
        )

        this.bot.command('logtransaction',
            async (ctx, next) => await this.requireAuth(ctx, next),
            async(ctx) => {
                ctx.reply('Log Your Transaction, Let\'s help you store them', {
                    reply_markup: {
                        force_reply: true,
                        input_field_placeholder: 'Type up to 100 characters...'
                    }
                });
            }
        )

        this.bot.on('text', async (ctx) => {
            const messageText = ctx.message.text;
            const telegram_id = ctx.from?.id;
            const user = await models.User.findOne({ where: {telegram_id: telegram_id}});    
            if (ctx.message.reply_to_message?.text === 'Log Your Transaction, Let\'s help you store them') {
                if (messageText.length > 100) {
                    ctx.reply('Please limit your response to 100 characters.');                    
                } else {
                  const response = await runcheck(transaction_text);
                  while(response) {
                    console.log(`User typed: ${messageText}`);
                    transaction_text = messageText;                   
                    const userCategories = await user.getCategories();
                    cpyUser_categories = userCategories;
                    for (const category of userCategories){
                        console.log(`User is associated with category: ${category.name}`);
                    }
                    const inlineKeyboard = userCategories.map((category, index) => {
                        return [Markup.button.callback(category.name, `option_${index + 1}`)];
                      });

                    inlineKeyboard.push([Markup.button.callback('Other', 'other')]);

                    ctx.reply(
                        'Please pick a category or type a custom category if none of these match:',
                        Markup.inlineKeyboard(inlineKeyboard)
                    );
                    break;

                  }

                  ctx.reply('Log Your Transaction, Let\'s help you store them', {
                    reply_markup: {
                        force_reply: true,
                        input_field_placeholder: 'Invalid input, Retype...'
                    }
                  });
                                    
                }
            } else if (ctx.message.reply_to_message?.text === 'Please type your custom input below:') {
                console.log(`Custom Category: ${messageText}`);
                const newcategory = await models.Category.create({
                    name: messageText,
                    user_id: user.id,
                    is_public: false
                });
                const newUsercategory = await models.UserCategory.create({ 
                    user_id: user.id,
                    category_id: newcategory.id
                });
                const response = await runcheck(transaction_text);
                if (response) {
                    const newTxn = await models.Transaction.create({
                        transaction_text: response.text,
                        transaction_type: response.type,
                        amount: response.amount,
                        recipient: response.recipient,
                        user_id: user.id,
                        usercategory_id: newUsercategory.id
                    })
                }
                ctx.reply(`I have saved ${messageText} into your personal category list`);
            }
        });

        this.bot.action(/option_\d|other/, async (ctx) => {
            // const messageText = ctx.message.text;
            const telegram_id = ctx.from?.id;
            const user = await models.User.findOne({ where: {telegram_id: telegram_id}});

            const selectedOption = ctx.match[0];
            console.log(`Button clicked: ${selectedOption}`);
            await ctx.editMessageReplyMarkup({ inline_keyboard: [] }).catch(() => {});

            if (selectedOption === 'other') {
                console.log('E PICK AM!');
                await ctx.reply('Please type your custom input below:', {
                    reply_markup: {
                        force_reply: true,
                        input_field_placeholder: 'Type your custom input...'
                    }
                });
            } else {
                const parsed_selectedOption = selectedOption.replace('_', ' ').toUpperCase();
                await ctx.reply(`You selected: ${parsed_selectedOption}`);
                const index = parseInt(parsed_selectedOption[parsed_selectedOption.length - 1]) - 1;
                let selected_category;
                if (!isNaN(index)) {
                    selected_category = cpyUser_categories[index];
                    const usercategory = await models.UserCategory.findOne({ where: { category_id: selected_category.id }});
                    const response = await runcheck(transaction_text);
                    if (response) {
                        await models.Transaction.create({
                            transaction_text: response.text,
                            transaction_type: response.type,
                            amount: response.amount,
                            recipient: response.recipient,
                            user_id: user.id,
                            usercategory_id: usercategory.id
                        });
                    }                   

                } 
                await ctx.reply(`You selected: ${parsed_selectedOption}`);

            }

        });        
        
    }

    async initialize() {
        this.bot = new Telegraf(this.token);
        
        // Setup error handlers
        this.bot.catch((err) => {
          console.error('Bot error:', err);
          this.handleError(err);
        });
        await this.setupHandlers();    
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