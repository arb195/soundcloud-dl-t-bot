# Soundcloud Downloader Telegram Bot

A Telegram bot that downloads tracks from Soundcloud.

## Setup

1. Clone this repository
2. Install dependencies using either npm or yarn:

Using npm:

```bash
npm install
```

Using yarn:

```bash
yarn install
```

3. Copy `.env.example` to `.env` and fill in your credentials:
   - Get a Telegram bot token from [@BotFather](https://t.me/botfather)
   - Get a Soundcloud Client ID by registering your application

## Running Locally

Using npm:

```bash
npm run dev
```

Using yarn:

```bash
yarn dev
```

## Deploying to Cloudflare Workers

1. Install Wrangler CLI:

Using npm:

```bash
npm install -g wrangler
```

Using yarn:

```bash
yarn global add wrangler
```

2. Create a new Cloudflare Worker project:

```bash
wrangler init
```

3. Configure your `wrangler.toml`:
   The configuration file is already included in the project. You need to:

- Add your BOT_TOKEN and SOUNDCLOUD_CLIENT_ID in Cloudflare Dashboard
- Create a KV namespace in Cloudflare Dashboard and update the IDs in wrangler.toml

4. Deploy to Cloudflare Workers:

```bash
wrangler deploy
```

## Project Structure

- `src/`
  - `index.js` - Main bot file
  - `config/` - Configuration files
  - `handlers/` - Message handlers
  - `utils/` - Utility functions
- `wrangler.toml` - Cloudflare Workers configuration
- `.env` - Environment variables

## Features

- Download Soundcloud tracks
- Get track information
- Simple and user-friendly interface
- Error handling
- Cloudflare Workers compatible
- KV storage support

## License

MIT
