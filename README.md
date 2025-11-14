# AINO Telegram Bot

Bot Telegram để xử lý flow liên kết tài khoản và mission join channel.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure `.env`:
```bash
BOT_TOKEN=your_bot_token
BACKEND_API_URL=http://localhost:8000/api/v1
BACKEND_API_KEY=your_api_key
CHANNEL_INVITE_LINK=https://t.me/+xxxxx
```

3. Run bot:
```bash
npm start
```

## Flow

1. User clicks "Connect Telegram" in app
2. App generates tracking code and redirects to bot: `https://t.me/AinoshaBot?start=TG-XXX`
3. Bot receives tracking code and calls backend webhook
4. Backend links Telegram account with user
5. Bot sends channel link to user
6. User joins channel and returns to app to verify mission

## Commands

- `/start` - Link Telegram account
- `/help` - Show help message
# ainoshabot
