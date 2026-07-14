const hubSpotClient = require("../clients/hubSpotClient");
const {
  validatePaginationOptions,
  validateProperties,
  validateObjectId,
} = require("../utils/validateHubSpotPayload");

/**
 * Fetches a single page of deals from HubSpot.
 *
 * @param {object} [options]
 * @param {string} [options.after] - Pagination cursor from a previous response.
 * @param {number} [options.limit=100] - Page size (HubSpot max is 100).
 * @param {string[]} [options.properties=["dealname","amount","dealstage","pipeline"]] - Deal properties to include in the response.
 * @returns {Promise<{results: object[], paging?: {next?: {after: string}}}>}
 */
async function findPage({
  after,
  limit = 100,
  properties = ["dealname", "amount", "dealstage", "pipeline"],
} = {}) {
  validatePaginationOptions({ after, limit, properties });

  const response = await hubSpotClient.get("/crm/v3/objects/deals", {
    params: {
      after,
      limit,
      properties: properties.join(","),
    },
  });

  return response.data;
}

/**
 * Creates a new deal in HubSpot.
 *
 * @param {object} properties - Deal properties, e.g. { dealname, amount, pipeline, dealstage }.
 * @returns {Promise<object>} The created deal, including its HubSpot id.
 */
async function create(properties) {
  validateProperties(properties);

  const response = await hubSpotClient.post("/crm/v3/objects/deals", {
    properties,
  });

  return response.data;
}

/**
 * Updates an existing deal's properties (partial update).
 *
 * @param {string|number} dealId
 * @param {object} properties - Only the properties to change.
 * @returns {Promise<object>} The updated deal.
 */
async function update(dealId, properties) {
  validateObjectId(dealId);
  validateProperties(properties);

  const response = await hubSpotClient.patch(`/crm/v3/objects/deals/${dealId}`, {
    properties,
  });

  return response.data;
}

/**
 * Deletes (archives) a deal in HubSpot.
 *
 * @param {string|number} dealId
 * @returns {Promise<boolean>} true if the deletion succeeded.
 */
async function remove(dealId) {
  validateObjectId(dealId);

  await hubSpotClient.delete(`/crm/v3/objects/deals/${dealId}`);

  return true;
}

module.exports = { findPage, create, update, remove };
