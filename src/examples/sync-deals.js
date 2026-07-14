const deals = require("../data/deals.json");
const { syncDealsWithHubSpot } = require("../services/hubSpotService");

async function run() {
  console.log(`Syncing ${deals.length} deal(s) with HubSpot...`);

  try {
    const result = await syncDealsWithHubSpot(deals);

    console.log(`Sync completed. Status: ${result.status}`);
    result.results.forEach((deal) => {
      console.log(`  id: ${deal.id}`, deal.properties);
    });
  } catch (error) {
    console.error("Failed to sync deals:", error.message);
  }
}

run();
