const hubSpotClient = require("../clients/hubSpotClient");
const { validateObjectId } = require("../utils/validateHubSpotPayload");

/**
 * Creates a default association between two HubSpot objects using the v4
 * associations endpoint. Idempotent: calling it again with the same pair of
 * objects does not create a duplicate association.
 *
 * @param {string} fromObjectType - e.g. "contacts"
 * @param {string|number} fromObjectId
 * @param {string} toObjectType - e.g. "deals"
 * @param {string|number} toObjectId
 * @returns {Promise<object>} The association details returned by HubSpot.
 */
async function associate(fromObjectType, fromObjectId, toObjectType, toObjectId) {
  validateObjectId(fromObjectId);
  validateObjectId(toObjectId);

  const response = await hubSpotClient.put(
    `/crm/v4/objects/${fromObjectType}/${fromObjectId}/associations/default/${toObjectType}/${toObjectId}`
  );

  return response.data;
}

module.exports = { associate };
