const { deleteHubSpotDeal } = require("../services/hubSpotService");

async function run() {
  const dealId = process.argv[2];

  if (!dealId) {
    console.error("Usage: node src/examples/delete-deal.js <dealId>");
    process.exitCode = 1;
    return;
  }

  console.log(`Deleting deal ${dealId} in HubSpot...`);

  try {
    const success = await deleteHubSpotDeal(dealId);
    console.log(success ? "Deal deleted successfully." : "Deletion failed.");
  } catch (error) {
    console.error("Failed to delete deal:", error.message);
  }
}

run();
