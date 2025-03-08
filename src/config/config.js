import dotenv from "dotenv";
dotenv.config();

export const config = {
  BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
};
