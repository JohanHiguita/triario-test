const { getHubSpotContacts } = require("../services/hubSpotService");

async function run() {
  console.log("Fetching a page of contacts from HubSpot...");

  try {
    const { results, paging } = await getHubSpotContacts({ limit: 10 });

    console.log(`Fetched ${results.length} contact(s):`);
    results.forEach((contact) => {
      console.log(`  id: ${contact.id}`, contact.properties);
    });

    console.log(
      paging?.next?.after
        ? `There are more contacts. Next cursor: ${paging.next.after}`
        : "This was the last page."
    );
  } catch (error) {
    console.error("Failed to fetch contacts:", error.message);
  }
}

run();
