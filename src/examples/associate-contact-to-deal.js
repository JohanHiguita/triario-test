const { associateContactToDeal } = require("../services/hubSpotService");

async function run() {
  const [contactId, dealId] = process.argv.slice(2);

  if (!contactId || !dealId) {
    console.error(
      "Usage: node src/examples/associate-contact-to-deal.js <contactId> <dealId>"
    );
    process.exitCode = 1;
    return;
  }

  console.log(`Associating contact ${contactId} with deal ${dealId}...`);

  try {
    const association = await associateContactToDeal(contactId, dealId);
    console.log("Association created successfully:");
    console.log(association);
  } catch (error) {
    console.error("Failed to associate contact with deal:", error.message);
  }
}

run();
