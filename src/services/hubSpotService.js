const contactRepository = require("../repositories/contactRepository");

/**
 * Returns the full name ("firstname lastname") of every contact in the
 * HubSpot account, following the cursor-based pagination until exhausted.
 *
 * @returns {Promise<string[]>}
 */
async function getHubSpotContactNames() {
  const fullNames = [];
  let after;

  do {
    const { results, paging } = await contactRepository.findPage({ after });

    for (const contact of results) {
      const { firstname = "", lastname = "" } = contact.properties;
      fullNames.push(`${firstname} ${lastname}`.trim());
    }

    after = paging?.next?.after;
  } while (after);

  return fullNames;
}

module.exports = { getHubSpotContactNames };
