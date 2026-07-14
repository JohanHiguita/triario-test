const propertyRepository = require("../repositories/propertyRepository");

const DEAL_UNIQUE_ID_PROPERTY = {
  name: "external_deal_id",
  label: "External Deal ID",
  type: "string",
  fieldType: "text",
  groupName: "dealinformation", // this is the group name in the HubSpot UI (standard group name)
  hasUniqueValue: true,
};

async function run() {
  console.log(`Ensuring "${DEAL_UNIQUE_ID_PROPERTY.name}" property exists on deals...`);

  try {
    const { created } = await propertyRepository.ensureExists("deals", DEAL_UNIQUE_ID_PROPERTY);

    console.log(
      created
        ? `Property "${DEAL_UNIQUE_ID_PROPERTY.name}" created successfully.`
        : `Property "${DEAL_UNIQUE_ID_PROPERTY.name}" already existed, nothing to do.`
    );
  } catch (error) {
    console.error("Failed to set up deal property:", error.message);
  }
}

run();
