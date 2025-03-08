const API_BASE_URL = "https://soundcloud-downloader.com/api";

export const getTrackInfo = async (url) => {
  try {
    // First get track info
    const infoResponse = await fetch(
      `${API_BASE_URL}/track?url=${encodeURIComponent(url)}`
    );
    const trackData = await infoResponse.json();

    if (!trackData.success) {
      throw new Error(trackData.error || "Failed to get track information");
    }

    return {
      title: trackData.title,
      user: {
        username: trackData.author,
      },
      duration: trackData.duration * 1000, // Convert to milliseconds
      thumbnail: trackData.thumbnail,
      downloadUrl: trackData.download_url,
    };
  } catch (error) {
    console.error("Error getting track info:", error);
    throw new Error("Failed to get track information");
  }
};

export const downloadTrack = async (url) => {
  try {
    const info = await getTrackInfo(url);

    if (!info.downloadUrl) {
      throw new Error("No download URL available");
    }

    // Download the file
    const response = await fetch(info.downloadUrl);

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
