import scdl from "soundcloud-downloader";
import { config } from "../config/config.js";

export const getTrackInfo = async (url) => {
  try {
    const client = new scdl.create({ clientId: config.SOUNDCLOUD_CLIENT_ID });
    const info = await client.getInfo(url);
    return info;
  } catch (error) {
    throw new Error("Failed to get track information");
  }
};

export const downloadTrack = async (url) => {
  try {
    const client = new scdl.create({ clientId: config.SOUNDCLOUD_CLIENT_ID });
    const buffer = await client.download(url);
    return buffer;
  } catch (error) {
    throw new Error("Failed to download track");
  }
};
