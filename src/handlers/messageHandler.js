import { getTrackInfo, downloadTrack } from "../utils/soundcloud.js";

export const handleStart = async (ctx) => {
  await ctx.reply(
    "Welcome to Soundcloud Downloader Bot! 🎵\nSend me a Soundcloud track URL to download it."
  );
};

export const handleHelp = async (ctx) => {
  await ctx.reply(
    "How to use this bot:\n\n" +
      "1. Copy a Soundcloud track URL\n" +
      "2. Send it to this bot\n" +
      "3. Wait for the download to complete\n\n" +
      "For any issues, please contact @yourusername"
  );
};

export const handleUrl = async (ctx) => {
  const url = ctx.message.text;

  if (!url.includes("soundcloud.com")) {
    return ctx.reply("Please send a valid Soundcloud URL");
  }

  try {
    await ctx.reply("Processing your request... ⏳");

    const trackInfo = await getTrackInfo(url);
    await ctx.reply(`Found track: ${trackInfo.title}\nDownloading... 📥`);

    const audioBuffer = await downloadTrack(url);

    await ctx.replyWithAudio({
      source: audioBuffer,
      filename: `${trackInfo.title}.mp3`,
      title: trackInfo.title,
      performer: trackInfo.user.username,
    });

    await ctx.reply("Download completed! 🎉");
  } catch (error) {
    await ctx.reply(
      "Sorry, there was an error processing your request. Please try again later. ❌"
    );
    console.error("Error:", error.message);
  }
};
