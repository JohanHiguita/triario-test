const { deleteHubSpotContact } = require("../services/hubSpotService");

async function run() {
  const contactId = process.argv[2];

  if (!contactId) {
    console.error("Usage: node src/examples/delete-contact.js <contactId>");
    process.exitCode = 1;
    return;
  }

  console.log(`Deleting contact ${contactId} in HubSpot...`);

  try {
    const success = await deleteHubSpotContact(contactId);
    console.log(success ? "Contact deleted successfully." : "Deletion failed.");
  } catch (error) {
    console.error("Failed to delete contact:", error.message);
  }
}

run();
