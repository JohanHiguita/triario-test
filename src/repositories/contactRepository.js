const hubSpotClient = require("../clients/hubSpotClient");
const {
  validatePaginationOptions,
  validateProperties,
  validateObjectId,
  validateBatchUpsertInput,
} = require("../utils/validateHubSpotPayload");

/**
 * Fetches a single page of contacts from HubSpot.
 *
 * @param {object} [options]
 * @param {string} [options.after] - Pagination cursor from a previous response.
 * @param {number} [options.limit=100] - Page size (HubSpot max is 100).
 * @param {string[]} [options.properties=["firstname","lastname"]] - Contact properties to include in the response.
 * @returns {Promise<{results: object[], paging?: {next?: {after: string}}}>}
 */
async function findPage({
  after,
  limit = 100,
  properties = ["firstname", "lastname"],
} = {}) {
  validatePaginationOptions({ after, limit, properties });

  const response = await hubSpotClient.get("/crm/v3/objects/contacts", {
    params: {
      after,
      limit,
      properties: properties.join(","),
    },
  });

  return response.data;
}

/**
 * Creates a new contact in HubSpot.
 *
 * @param {object} properties - Contact properties, e.g. { email, firstname, lastname }.
 * @returns {Promise<object>} The created contact, including its HubSpot id.
 */
async function create(properties) {
  validateProperties(properties);

  const response = await hubSpotClient.post("/crm/v3/objects/contacts", {
    properties,
  });

  return response.data;
}

/**
 * Updates an existing contact's properties (partial update).
 *
 * @param {string|number} contactId
 * @param {object} properties - Only the properties to change.
 * @returns {Promise<object>} The updated contact.
 */
async function update(contactId, properties) {
  validateObjectId(contactId);
  validateProperties(properties);

  const response = await hubSpotClient.patch(
    `/crm/v3/objects/contacts/${contactId}`,
    { properties }
  );

  return response.data;
}

/**
 * Deletes (archives) a contact in HubSpot.
 *
 * @param {string|number} contactId
 * @returns {Promise<boolean>} true if the deletion succeeded.
 */
async function remove(contactId) {
  validateObjectId(contactId);

  await hubSpotClient.delete(`/crm/v3/objects/contacts/${contactId}`);

  return true;
}

/**
 * Creates or updates a batch of contacts in a single request, using "email"
 * as the unique identifier: contacts whose email already exists are
 * updated, contacts whose email doesn't exist yet are created.
 * POST /crm/v3/objects/contacts/batch/upsert
 *
 * @param {object[]} contacts - Each item must include at least an "email".
 * @returns {Promise<object>} HubSpot's batch response (results + any errors).
 */
async function upsertBatch(contacts) {
  validateBatchUpsertInput(contacts, "email");

  const inputs = contacts.map((contact) => ({
    id: contact.email,
    idProperty: "email",
    properties: contact,
  }));

  const response = await hubSpotClient.post(
    "/crm/v3/objects/contacts/batch/upsert",
    { inputs }
  );

  return response.data;
}

module.exports = { findPage, create, update, remove, upsertBatch };
