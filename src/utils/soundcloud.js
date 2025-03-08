const DLAPI_BASE_URL = "https://co.wuk.sh/api/json"; // Using a reliable API service

export const getTrackInfo = async (url) => {
  try {
    const response = await fetch(DLAPI_BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        url: url,
        aFormat: "mp3",
      }),
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.text || "Failed to get track information");
    }

    return {
      title: data.meta?.title || "Unknown Title",
      user: {
        username: data.meta?.artist || "Unknown Artist",
      },
      duration: data.meta?.duration || 0,
      thumbnail: data.thumb,
      downloadUrl: data.url,
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

    const response = await fetch(info.downloadUrl);
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error("Error downloading track:", error);
    throw new Error("Failed to download track");
  }
};
