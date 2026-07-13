const { createHubSpotContact } = require("../services/hubSpotService");

async function run() {
  console.log("Creating contact in HubSpot...");

  try {
    const contact = await createHubSpotContact({
      email: "johan@example.com",
      firstname: "Johan",
      lastname: "Higuita",
    });

    console.log("Contact created successfully:");
    console.log(`  id: ${contact.id}`);
    console.log(`  properties:`, contact.properties);
  } catch (error) {
    console.error("Failed to create contact:", error.message);
  }
}

run();
