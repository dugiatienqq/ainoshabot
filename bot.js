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

    if (response.data.success) {
      // Success - send channel link
      await bot.sendMessage(
        chatId,
        `✅ Tài khoản Telegram đã được liên kết thành công!\n\n` +
        `🎯 Bây giờ hãy tham gia channel của chúng tôi để hoàn thành nhiệm vụ:\n` +
        `👉 ${process.env.CHANNEL_INVITE_LINK}\n\n` +
        `Sau khi tham gia, quay lại app AINO và bấm nút để verify nhận thưởng!`,
        {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: '📢 Tham gia Channel ' + process.env.CHANNEL_NAME,
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

    let errorMessage = '❌ Có lỗi xảy ra khi liên kết tài khoản.';

    if (error.response?.status === 404) {
      errorMessage = '❌ Mã liên kết không tồn tại hoặc đã được sử dụng.\n\nVui lòng tạo mã mới từ app AINO.';
    } else if (error.response?.status === 410) {
      errorMessage = '❌ Mã liên kết đã hết hạn.\n\nVui lòng quay lại app AINO và tạo mã mới.';
    } else if (error.response?.status === 422) {
      errorMessage = '❌ Dữ liệu không hợp lệ. Vui lòng thử lại từ app AINO.';
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
    `👋 Chào ${firstName}! Chào mừng đến với AINO Bot!\n\n` +
    `Để liên kết tài khoản Telegram của bạn:\n` +
    `1️⃣ Mở app AINO\n` +
    `2️⃣ Bấm nút "Connect Telegram"\n` +
    `3️⃣ Bạn sẽ được chuyển về đây tự động\n\n` +
    `📢 Channel: ${process.env.CHANNEL_USERNAME}`,
    {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '📱 Mở App AINO',
              url: 'https://staging-app.ainosha.com'
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
    `🤖 *AINO Bot - Hướng dẫn*\n\n` +
    `/start - Kết nối tài khoản Telegram\n` +
    `/help - Hiển thị hướng dẫn này\n\n` +
    `💡 *Cách sử dụng:*\n` +
    `1. Mở app AINO và bấm "Connect Telegram"\n` +
    `2. Làm theo hướng dẫn để hoàn thành nhiệm vụ\n` +
    `3. Nhận thưởng điểm sau khi verify\n\n` +
    `📢 Tham gia channel: ${process.env.CHANNEL_USERNAME}`,
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
