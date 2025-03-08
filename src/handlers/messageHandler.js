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
      "For any issues, please try again later."
  );
};

export const handleUrl = async (ctx) => {
  const url = ctx.message.text;

  if (!url.includes("soundcloud.com")) {
    return ctx.reply("Please send a valid Soundcloud URL 🎵");
  }

  try {
    const statusMessage = await ctx.reply("Processing your request... ⏳");

    // Get track info first
    const trackInfo = await getTrackInfo(url);
    await ctx.reply(
      `Found track: ${trackInfo.title}\n` +
        `Artist: ${trackInfo.user.username}\n` +
        `Downloading... 📥`
    );

    // Download the track
    const audioBuffer = await downloadTrack(url);

    // Send the audio file
    await ctx.replyWithAudio({
      source: audioBuffer,
      filename: `${trackInfo.title}.mp3`,
      title: trackInfo.title,
      performer: trackInfo.user.username,
      duration: Math.floor(trackInfo.duration / 1000), // Convert to seconds
    });

    await statusMessage.delete().catch(() => {}); // Clean up status message
    await ctx.reply("Download completed! 🎉");
  } catch (error) {
    console.error("Error:", error);

    let errorMessage = "Sorry, there was an error processing your request. ";

    if (error.message.includes("Failed to get track information")) {
      errorMessage += "Could not fetch track information. ";
    } else if (error.message.includes("No download URL")) {
      errorMessage += "Could not get download link. ";
    }

    errorMessage += "Please try again later. ❌";

    await ctx.reply(errorMessage);
  }
};
