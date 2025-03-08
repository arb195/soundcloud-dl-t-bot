const DLAPI_BASE_URL = "https://api.sclouddownloader.net/v1";

async function getDownloadUrl(url) {
  try {
    // First request to get track ID
    const response = await fetch(
      `${DLAPI_BASE_URL}/track?url=${encodeURIComponent(url)}`
    );
    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || "Failed to get track information");
    }

    // Second request to get download URL
    const downloadResponse = await fetch(`${DLAPI_BASE_URL}/download`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        track_id: data.track.id,
      }),
    });

    const downloadData = await downloadResponse.json();

    if (!downloadData.success) {
      throw new Error(downloadData.error || "Failed to get download URL");
    }

    return {
      downloadUrl: downloadData.download_url,
      trackInfo: data.track,
    };
  } catch (error) {
    console.error("Error getting download URL:", error);
    throw error;
  }
}

export const getTrackInfo = async (url) => {
  try {
    const { trackInfo } = await getDownloadUrl(url);

    return {
      title: trackInfo.title || "Unknown Title",
      user: {
        username: trackInfo.user?.username || "Unknown Artist",
      },
      duration: trackInfo.duration || 0,
      thumbnail: trackInfo.artwork_url,
      downloadUrl: null, // Will be fetched during download
    };
  } catch (error) {
    console.error("Error getting track info:", error);
    throw new Error("Failed to get track information");
  }
};

export const downloadTrack = async (url) => {
  try {
    const { downloadUrl } = await getDownloadUrl(url);

    if (!downloadUrl) {
      throw new Error("No download URL available");
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
