const hubSpotClient = require("../clients/hubSpotClient");

/**
 * Fetches a single page of contacts from HubSpot.
 *
 * @param {object} [options]
 * @param {string} [options.after] - Pagination cursor from a previous response.
 * @param {number} [options.limit=100] - Page size (HubSpot max is 100).
 * @param {string[]} [options.properties=["firstname","lastname"]] - Contact properties to include in the response.
 * @returns {Promise<{results: object[], paging?: {next?: {after: string}}}>}
 */
async function findAll({
  after,
  limit = 100,
  properties = ["firstname", "lastname"],
} = {}) {
  const response = await hubSpotClient.get("/crm/v3/objects/contacts", {
    params: {
      after,
      limit,
      properties: properties.join(","),
    },
  });

  return response.data;
}

module.exports = { findAll };
