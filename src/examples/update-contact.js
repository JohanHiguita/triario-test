const { updateHubSpotContact } = require("../services/hubSpotService");

async function run() {
  const contactId = process.argv[2];

  if (!contactId) {
    console.error("Usage: node src/examples/update-contact.js <contactId>");
    process.exitCode = 1;
    return;
  }

  console.log(`Updating contact ${contactId} in HubSpot...`);

  try {
    const contact = await updateHubSpotContact(contactId, {
      lastname: "Test Updated",
    });

    console.log("Contact updated successfully:");
    console.log(`  id: ${contact.id}`);
    console.log(`  properties:`, contact.properties);
  } catch (error) {
    console.error("Failed to update contact:", error.message);
  }
}

run();
