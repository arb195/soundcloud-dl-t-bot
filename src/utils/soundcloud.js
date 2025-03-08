class SoundCloud {
  constructor(clientId) {
    this.clientId = clientId;
  }

  async findTrackId(url) {
    try {
      console.log("Fetching page:", url);
      const response = await fetch(url);
      const html = await response.text();

      // Try to find track ID from window.__sc_hydration
      const hydrationMatch = html.match(/"id":(\d+),"kind":"track"/);
      if (hydrationMatch) {
        return hydrationMatch[1];
      }

      // Fallback: try to find from meta tags
      const metaMatch = html.match(/content="soundcloud:\/\/sounds:(\d+)"/);
      if (metaMatch) {
        return metaMatch[1];
      }

      console.log("Could not find track ID in HTML");
      return null;
    } catch (error) {
      console.error("Error finding track ID:", error);
      return null;
    }
  }

  async getTrackInfo(trackId) {
    try {
      console.log("Getting track info for ID:", trackId);
      const response = await fetch(
        `https://api-v2.soundcloud.com/tracks/${trackId}?client_id=${this.clientId}`
      );

      if (!response.ok) {
        throw new Error(`API response not ok: ${response.status}`);
      }

      const data = await response.json();
      console.log("Track info received:", data.title);
      return data;
    } catch (error) {
      console.error("Error getting track info:", error);
      throw new Error("Failed to get track information");
    }
  }

  async getMediaUrl(trackId) {
    try {
      console.log("Getting media URL for track:", trackId);
      const info = await this.getTrackInfo(trackId);

      if (info.downloadable && info.download_url) {
        const url = `${info.download_url}?client_id=${this.clientId}`;
        console.log("Found download URL");
        return url;
      }

      if (info.media && info.media.transcodings) {
        const progressive = info.media.transcodings.find(
          (t) => t.format.protocol === "progressive"
        );

        if (progressive) {
          const response = await fetch(
            `${progressive.url}?client_id=${this.clientId}`
          );
          const data = await response.json();
          console.log("Found streaming URL");
          return data.url;
        }
      }

      throw new Error("No suitable media URL found");
    } catch (error) {
      console.error("Error getting media URL:", error);
      throw error;
    }
  }
}

// Initialize with client ID
const CLIENT_ID = "a3e059563d7fd3372b49b37f00a00bcf";
const sc = new SoundCloud(CLIENT_ID);

export const getTrackInfo = async (url) => {
  console.log("Getting track info for URL:", url);
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
      streamable: true,
      trackId: trackId,
    };
  } catch (error) {
    console.error("Error in getTrackInfo:", error);
    throw new Error("Failed to get track information");
  }
};

export const downloadTrack = async (url) => {
  console.log("Starting download for URL:", url);
  try {
    const trackId = await sc.findTrackId(url);
    if (!trackId) {
      throw new Error("Could not find track ID");
    }

    const mediaUrl = await sc.getMediaUrl(trackId);
    console.log("Got media URL, downloading...");

    const response = await fetch(mediaUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    console.log("Download completed, size:", arrayBuffer.byteLength);
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error("Error in downloadTrack:", error);
    throw new Error("Failed to download track");
  }
};
