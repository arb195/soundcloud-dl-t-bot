import { Telegraf } from "telegraf";
import {
  handleStart,
  handleHelp,
  handleUrl,
} from "./handlers/messageHandler.js";

export default {
  async fetch(request, env, ctx) {
    const bot = new Telegraf(env.TELEGRAM_BOT_TOKEN);

    // Command handlers
    bot.command("start", handleStart);
    bot.command("help", handleHelp);

    // URL handler
    bot.on("text", handleUrl);

    // Error handler
    bot.catch((err, ctx) => {
      console.error(`Error for ${ctx.updateType}:`, err);
      ctx.reply("An error occurred while processing your request.");
    });

    try {
      // Handle Telegram webhook request
      if (request.method === "POST") {
        const update = await request.json();
        await bot.handleUpdate(update);
        return new Response("OK", { status: 200 });
      }

      // Return OK for other requests
      return new Response("Bot is running", { status: 200 });
    } catch (error) {
      console.error("Worker error:", error);
      return new Response("Error processing request", { status: 500 });
    }
  },
};
