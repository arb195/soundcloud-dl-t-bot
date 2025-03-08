import { Telegraf } from "telegraf";
import { config } from "./config/config.js";
import {
  handleStart,
  handleHelp,
  handleUrl,
} from "./handlers/messageHandler.js";

const bot = new Telegraf(config.BOT_TOKEN);

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

// Start the bot
bot
  .launch()
  .then(() => console.log("Bot is running..."))
  .catch((err) => console.error("Bot launch failed:", err));

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
