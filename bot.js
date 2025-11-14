require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

const bot = new TelegramBot(process.env.BOT_TOKEN, {
  polling: {
    interval: 300,
    autoStart: true,
    params: {
      timeout: 10
    }
  }
});

// Handle polling errors
bot.on('polling_error', (error) => {
  console.error('❌ Polling error:', error.code, error.message);
});

console.log('🤖 AINO Telegram Bot starting...');
console.log('📡 Backend API:', process.env.BACKEND_API_URL);
console.log('📢 Channel:', process.env.CHANNEL_NAME);

// Handle /start command with tracking code
bot.onText(/\/start (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const trackingCode = match[1];
  const telegramUserId = msg.from.id.toString();
  const telegramUsername = msg.from.username || null;

  console.log('\n📥 Received tracking code:', trackingCode);
  console.log('👤 User ID:', telegramUserId);
  console.log('👤 Username:', telegramUsername);

  try {
    // Call backend webhook to link account
    const response = await axios.post(
      `${process.env.BACKEND_API_URL}/webhook/telegram`,
      {
        tracking_code: trackingCode,
        telegram_user_id: telegramUserId,
        telegram_username: telegramUsername
      },
      {
        headers: {
          'X-API-Key': process.env.BACKEND_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Backend response:', response.data);

    if (response.data._metadata?.success) {
      // Success - send channel link
      await bot.sendMessage(
        chatId,
        `✅ Your Telegram account has been successfully linked!\n\n` +
        `🎯 Now join our channel to complete the task:\n` +
        `👉 ${process.env.CHANNEL_INVITE_LINK}\n\n` +
        `After joining, return to the web and click the button to verify and claim your reward!`,
        {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: '📢 Join Channel ' + process.env.CHANNEL_NAME,
                  url: process.env.CHANNEL_INVITE_LINK
                }
              ]
            ]
          }
        }
      );
    }
  } catch (error) {
    console.error('❌ Error linking account:', error.response?.data || error.message);

    let errorMessage = '❌ An error occurred while linking your account.';

    if (error.response?.status === 404) {
      errorMessage = '❌ The linking code does not exist or has already been used.\n\nPlease generate a new code from the AINO app.';
    } else if (error.response?.status === 410) {
      errorMessage = '❌ The linking code has expired.\n\nPlease return to the AINO app and generate a new code.';
    } else if (error.response?.status === 422) {
      errorMessage = '❌ Invalid data. Please try again from the AINO app.';
    }

    await bot.sendMessage(chatId, errorMessage);
  }
});

// Handle /start without tracking code
bot.onText(/\/start$/, async (msg) => {
  const chatId = msg.chat.id;
  const firstName = msg.from.first_name;

  await bot.sendMessage(
    chatId,
    `👋 Hello ${firstName}! Welcome to AINO Bot!\n\n` +
    `To link your Telegram account:\n` +
    `1️⃣ Open the AINO app\n` +
    `2️⃣ Click the "Connect Telegram" button\n` +
    `3️⃣ You will be redirected here automatically\n\n` +
    `📢 Channel: ${process.env.CHANNEL_USERNAME}`,
    {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '🌐 Open AINO Quest',
              url: 'https://aino-quest.vercel.app/'
            }
          ]
        ]
      }
    }
  );
});

// Handle /help command
bot.onText(/\/help/, async (msg) => {
  await bot.sendMessage(
    msg.chat.id,
    `🤖 *AINO Bot - Help*\n\n` +
    `/start - Connect Telegram account\n` +
    `/help - Display this help message\n\n` +
    `💡 *How to use:*\n` +
    `1. Open the AINO app and click "Connect Telegram"\n` +
    `2. Follow the instructions to complete the task\n` +
    `3. Receive reward points after verification\n\n` +
    `📢 Join channel: ${process.env.CHANNEL_USERNAME}`,
    { parse_mode: 'Markdown' }
  );
});

// Handle polling errors
bot.on('polling_error', (error) => {
  console.error('❌ Polling error:', error.code, error.message);
});

// Bot ready
bot.on('message', (msg) => {
  // Log all messages for debugging
  if (!msg.text?.startsWith('/')) {
    console.log('📨 Message from', msg.from.username || msg.from.id, ':', msg.text);
  }
});

console.log('✅ Bot is running and waiting for messages...');
console.log('🔗 Bot link: https://t.me/AinoshaBot');
console.log('\n📝 To test: Open Telegram and send /start to @AinoshaBot\n');
