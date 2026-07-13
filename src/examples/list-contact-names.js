const { getHubSpotContactNames } = require("../services/hubSpotService");

async function run() {
  console.log("Fetching contact names from HubSpot...");

  try {
    const names = await getHubSpotContactNames();

    console.log(`Found ${names.length} contact(s):`);
    names.forEach((name, index) => console.log(`${index + 1}. ${name}`));
  } catch (error) {
    console.error("Failed to fetch contact names:", error.message);
  }
}

run();
