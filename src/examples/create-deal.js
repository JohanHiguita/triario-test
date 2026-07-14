const { createHubSpotDeal } = require("../services/hubSpotService");

async function run() {
  console.log("Creating deal in HubSpot...");

  try {
    const deal = await createHubSpotDeal("Triario Test Deal 2", 5000);

    console.log("Deal created successfully:");
    console.log(`  id: ${deal.id}`);
    console.log(`  properties:`, deal.properties);
  } catch (error) {
    console.error("Failed to create deal:", error.message);
  }
}

run();
