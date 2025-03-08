import SCDL from "scdl-core";

// Initialize with client ID
const CLIENT_ID = "c2t0HZIZKBSJidX1GdH3UotrUjsj2DYd"; // Public client ID

SCDL.init({
  clientID: CLIENT_ID,
});

export const getTrackInfo = async (url) => {
  try {
    const trackInfo = await SCDL.getInfo(url);

    return {
      title: trackInfo.title,
      user: {
        username: trackInfo.user.username,
      },
      duration: trackInfo.duration,
      thumbnail: trackInfo.artwork_url,
      downloadUrl: trackInfo.permalink_url,
    };
  } catch (error) {
    console.error("Error getting track info:", error);
    throw new Error("Failed to get track information");
  }
};

export const downloadTrack = async (url) => {
  try {
    // Get download URL
    const downloadUrl = await SCDL.download(url);

    if (!downloadUrl) {
      throw new Error("No download URL available");
    }

    // Download the file
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
