class SoundCloud {
  constructor() {
    this.clientId = null;
    this.clientIdPromise = this.findClientId();
  }

  async findClientId() {
    try {
      // First, get the main page
      const mainPageResponse = await fetch("https://soundcloud.com");
      const mainPageHtml = await mainPageResponse.text();

      // Find all script URLs
      const scriptUrls = mainPageHtml.match(
        /https:\/\/[^"']*js\/app-[^"']*.js/g
      );
      if (!scriptUrls || scriptUrls.length === 0) {
        throw new Error("Could not find app script URL");
      }

      // Get the first app script
      const scriptResponse = await fetch(scriptUrls[0]);
      const scriptContent = await scriptResponse.text();

      // Look for client_id
      const clientIdMatch = scriptContent.match(/client_id:"([^"]+)"/);
      if (!clientIdMatch) {
        throw new Error("Could not find client_id in script");
      }

      this.clientId = clientIdMatch[1];
      return this.clientId;
    } catch (error) {
      console.error("Error finding client ID:", error);
      throw error;
    }
  }

  async ensureClientId() {
    if (!this.clientId) {
      await this.clientIdPromise;
    }
    return this.clientId;
  }

  async getTrackInfo(url) {
    try {
      // First get track ID from URL
      const trackIdMatch = url.match(/\/tracks\/(\d+)/);
      if (!trackIdMatch) {
        throw new Error("Invalid SoundCloud URL");
      }
      const trackId = trackIdMatch[1];

      // Ensure we have a client ID
      const clientId = await this.ensureClientId();

      // Get track info
      const response = await fetch(
        `https://api.soundcloud.com/tracks/${trackId}?client_id=${clientId}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error getting track info:", error);
      throw new Error("Failed to get track information");
    }
  }

  async getStreamUrl(trackId) {
    try {
      // Ensure we have a client ID
      const clientId = await this.ensureClientId();

      const response = await fetch(
        `https://api.soundcloud.com/tracks/${trackId}/stream?client_id=${clientId}`
      );

      if (!response.ok) {
        throw new Error("Could not get stream URL");
      }

      return response.url;
    } catch (error) {
      console.error("Error getting stream URL:", error);
      throw error;
    }
  }
}

// Initialize without client ID - it will be fetched automatically
const sc = new SoundCloud();

export const getTrackInfo = async (url) => {
  try {
    const trackInfo = await sc.getTrackInfo(url);
    return {
      title: trackInfo.title,
      user: {
        username: trackInfo.user.username,
      },
      duration: trackInfo.duration,
      thumbnail: trackInfo.artwork_url,
      streamable: trackInfo.streamable,
      trackId: trackInfo.id,
    };
  } catch (error) {
    console.error("Error getting track info:", error);
    throw new Error("Failed to get track information");
  }
};

export const downloadTrack = async (url) => {
  try {
    const trackInfo = await sc.getTrackInfo(url);
    const streamUrl = await sc.getStreamUrl(trackInfo.id);

    const response = await fetch(streamUrl);
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
