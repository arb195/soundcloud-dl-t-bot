import { Client } from "soundcloud-scraper";
const client = new Client();

export const getTrackInfo = async (url) => {
  try {
    const song = await client.getSongInfo(url);
    return {
      title: song.title,
      user: {
        username: song.author.name,
      },
      duration: song.duration,
      thumbnail: song.thumbnail,
    };
  } catch (error) {
    console.error("Error getting track info:", error);
    throw new Error("Failed to get track information");
  }
};

export const downloadTrack = async (url) => {
  try {
    const song = await client.getSongInfo(url);
    const stream = await song.downloadProgressive();
    const chunks = [];

    for await (const chunk of stream) {
      chunks.push(chunk);
    }

    return Buffer.concat(chunks);
  } catch (error) {
    console.error("Error downloading track:", error);
    throw new Error("Failed to download track");
  }
};
