const { updateHubSpotDeal } = require("../services/hubSpotService");

async function run() {
  const dealId = process.argv[2];

  if (!dealId) {
    console.error("Usage: node src/examples/update-deal.js <dealId>");
    process.exitCode = 1;
    return;
  }

  console.log(`Updating deal ${dealId} in HubSpot...`);

  try {
    const deal = await updateHubSpotDeal(dealId, {
      dealname: "Triario Test Deal Updated",
    });

    console.log("Deal updated successfully:");
    console.log(`  id: ${deal.id}`);
    console.log(`  properties:`, deal.properties);
  } catch (error) {
    console.error("Failed to update deal:", error.message);
  }
}

run();
