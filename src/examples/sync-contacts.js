const contacts = require("../data/contacts.json");
const { syncContactsWithHubSpot } = require("../services/hubSpotService");

async function run() {
  console.log(`Syncing ${contacts.length} contact(s) with HubSpot...`);

  try {
    const result = await syncContactsWithHubSpot(contacts);

    console.log(`Sync completed. Status: ${result.status}`);
    result.results.forEach((contact) => {
      console.log(`  id: ${contact.id}`, contact.properties);
    });
  } catch (error) {
    console.error("Failed to sync contacts:", error.message);
  }
}

run();
