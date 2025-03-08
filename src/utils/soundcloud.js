import { JSDOM } from "jsdom";

class SoundCloud {
  constructor(clientId) {
    this.clientId = clientId;
  }

  url(endpoint) {
    return `${endpoint}?client_id=${this.clientId}`;
  }

  async findTrackId(url) {
    try {
      const response = await fetch(url);
      const html = await response.text();

      // Use regex to find track ID
      const match = html.match(/soundcloud:\/\/sounds:(\d+)/);
      return match ? match[1] : null;
    } catch (error) {
      console.error("Error finding track ID:", error);
      return null;
    }
  }

  async getTrackInfo(trackId) {
    try {
      const url = this.url(`https://api.soundcloud.com/tracks/${trackId}/`);
      const response = await fetch(url);
      return await response.json();
    } catch (error) {
      console.error("Error getting track info:", error);
      throw new Error("Failed to get track information");
    }
  }

  async getDownloadUrl(trackId) {
    try {
      const url = this.url(
        `https://api.soundcloud.com/tracks/${trackId}/download`
      );
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Track not available for download");
      }
      return response.url;
    } catch (error) {
      console.error("Error getting download URL:", error);
      throw new Error("Failed to get download URL");
    }
  }

  async getStreamUrl(trackId) {
    try {
      const info = await this.getTrackInfo(trackId);
      if (info.streamable) {
        return this.url(info.stream_url);
      }
      throw new Error("Track is not streamable");
    } catch (error) {
      console.error("Error getting stream URL:", error);
      throw error;
    }
  }
}

// Initialize with client ID
const CLIENT_ID = "a3e059563d7fd3372b49b37f00a00bcf";
const sc = new SoundCloud(CLIENT_ID);

export const getTrackInfo = async (url) => {
  try {
    const trackId = await sc.findTrackId(url);
    if (!trackId) {
      throw new Error("Could not find track ID");
    }

    const trackInfo = await sc.getTrackInfo(trackId);

    return {
      title: trackInfo.title,
      user: {
        username: trackInfo.user.username,
      },
      duration: trackInfo.duration,
      thumbnail: trackInfo.artwork_url,
      downloadable: trackInfo.downloadable,
      streamable: trackInfo.streamable,
      trackId: trackId,
    };
  } catch (error) {
    console.error("Error getting track info:", error);
    throw new Error("Failed to get track information");
  }
};

export const downloadTrack = async (url) => {
  try {
    const trackId = await sc.findTrackId(url);
    if (!trackId) {
      throw new Error("Could not find track ID");
    }

    const trackInfo = await sc.getTrackInfo(trackId);
    let downloadUrl;

    if (trackInfo.downloadable) {
      downloadUrl = await sc.getDownloadUrl(trackId);
    } else if (trackInfo.streamable) {
      downloadUrl = await sc.getStreamUrl(trackId);
    } else {
      throw new Error("Track is not available for download or streaming");
    }

    const response = await fetch(downloadUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error("Error downloading track:", error);
    throw new Error("Failed to download track");
  }
};
