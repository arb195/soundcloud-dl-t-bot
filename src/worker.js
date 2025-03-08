import { Telegraf } from "telegraf";
import {
  handleStart,
  handleHelp,
  handleUrl,
} from "./handlers/messageHandler.js";

// Function to set up webhook
async function setupWebhook(token, url) {
  const webhookUrl = `https://api.telegram.org/bot${token}/setWebhook`;
  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      url: url,
      allowed_updates: ["message", "callback_query"],
    }),
  });
  return await response.json();
}

export default {
  async fetch(request, env, ctx) {
    // Get the worker's URL
    const url = new URL(request.url);
    const workerUrl = `${url.protocol}//${url.hostname}`;

    // Log environment variables (be careful not to log the actual token in production)
    console.log("Environment check:", {
      hasToken: !!env.TELEGRAM_BOT_TOKEN,
      tokenLength: env.TELEGRAM_BOT_TOKEN?.length,
      workerUrl: workerUrl,
    });

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
      // Setup webhook on GET request to /setup-webhook
      if (request.method === "GET" && url.pathname === "/setup-webhook") {
        const result = await setupWebhook(env.TELEGRAM_BOT_TOKEN, workerUrl);
        return new Response(JSON.stringify(result, null, 2), {
          status: result.ok ? 200 : 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Handle Telegram webhook request
      if (request.method === "POST") {
        const update = await request.json();
        await bot.handleUpdate(update);
        return new Response("OK", { status: 200 });
      }

      // Return info for other requests
      return new Response(
        JSON.stringify(
          {
            status: "Bot is running",
            setupWebhookUrl: `${workerUrl}/setup-webhook`,
          },
          null,
          2
        ),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    } catch (error) {
      console.error("Worker error:", error);
      return new Response(
        JSON.stringify(
          {
            error: "Error processing request",
            message: error.message,
          },
          null,
          2
        ),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  },
};
