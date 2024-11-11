import { Composer } from "telegraf";

const transactionLoggerComposer = new Composer();

transactionLoggerComposer.command('logtransaction', (ctx) => {
  ctx.reply('Log Your Transaction, Let\'s help you store them', {
    reply_markup: {
      force_reply: true,
      input_field_placeholder: 'Type up to 100 characters...'
    }
  });
});

transactionLoggerComposer.on('text', (ctx) => {
  const messageText = ctx.message.text;

  if (ctx.message.reply_to_message?.text === 'Log Your Transaction, Let\'s help you store them') {
    if (messageText.length > 100) {
      ctx.reply('Please limit your response to 100 characters.');
    } else {
      console.log(`User typed: ${messageText}`);
      ctx.reply(
        'Please pick a category or type a custom category if none of these match:',
        Markup.inlineKeyboard([
          [Markup.button.callback('Option 1', 'option_1')],
          [Markup.button.callback('Option 2', 'option_2')],
          [Markup.button.callback('Option 3', 'option_3')],
          [Markup.button.callback('Option 4', 'option_4')],
          [Markup.button.callback('Other', 'other')]
        ])
      );
    }
  } else if (ctx.message.reply_to_message?.text === 'Please type your custom input below:') {
    console.log(`Custom Category: ${messageText}`);
    ctx.reply(
      'I DON SAVE AM',
    );
  }
});

transactionLoggerComposer.action(/option_\d|other/, async (ctx) => {
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
    await ctx.reply(`You selected: ${selectedOption.replace('_', ' ').toUpperCase()}`);
  }
});

export default transactionLoggerComposer;