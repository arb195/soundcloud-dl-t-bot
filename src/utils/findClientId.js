import fetch from "node-fetch";

async function findClientId() {
  try {
    // First, get the main page
    console.log("Fetching SoundCloud main page...");
    const mainPageResponse = await fetch("https://soundcloud.com");
    const mainPageHtml = await mainPageResponse.text();

    // Find all script URLs
    const scriptUrls = mainPageHtml.match(/https:\/\/[^"']*js\/app-[^"']*.js/g);

    if (!scriptUrls || scriptUrls.length === 0) {
      throw new Error("Could not find app script URL");
    }

    // Get the first app script
    console.log("Fetching app script...");
    const scriptResponse = await fetch(scriptUrls[0]);
    const scriptContent = await scriptResponse.text();

    // Look for client_id
    const clientIdMatch = scriptContent.match(/client_id:"([^"]+)"/);
    if (!clientIdMatch) {
      throw new Error("Could not find client_id in script");
    }

    const clientId = clientIdMatch[1];
    console.log("Found client ID:", clientId);
    return clientId;
  } catch (error) {
    console.error("Error finding client ID:", error);
    throw error;
  }
}

// Test the function
console.log("Starting client ID search...");
findClientId()
  .then((clientId) => {
    console.log("Success! Client ID:", clientId);
    console.log("You can use this client ID in your soundcloud.js file");
  })
  .catch((error) => {
    console.error("Failed to find client ID:", error);
  });
