const { getHubSpotDeals } = require("../services/hubSpotService");

async function run() {
  console.log("Fetching a page of deals from HubSpot...");

  try {
    const { results, paging } = await getHubSpotDeals({ limit: 10 });

    console.log(`Fetched ${results.length} deal(s):`);
    results.forEach((deal) => {
      console.log(`  id: ${deal.id}`, deal.properties);
    });

    console.log(
      paging?.next?.after
        ? `There are more deals. Next cursor: ${paging.next.after}`
        : "This was the last page."
    );
  } catch (error) {
    console.error("Failed to fetch deals:", error.message);
  }
}

run();
