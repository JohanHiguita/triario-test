const contactRepository = require("../repositories/contactRepository");
const dealRepository = require("../repositories/dealRepository");

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

/**
 * Lists a single page of contacts with their full details, as returned by
 * HubSpot (results + pagination cursor). Caller decides which properties to
 * fetch and how to page through results.
 *
 * @param {object} [options]
 * @param {string} [options.after] - Pagination cursor from a previous call.
 * @param {number} [options.limit] - Page size (HubSpot max is 100).
 * @param {string[]} [options.properties] - Contact properties to include.
 * @returns {Promise<{results: object[], paging?: {next?: {after: string}}}>}
 */
async function getHubSpotContacts({ after, limit, properties } = {}) {
  return contactRepository.findPage({ after, limit, properties });
}

/**
 * Creates a new contact in HubSpot.
 *
 * @param {object} properties - Contact properties, e.g. { email, firstname, lastname }.
 * @returns {Promise<object>} The created contact, including its HubSpot id.
 */
async function createHubSpotContact(properties) {
  return contactRepository.create(properties);
}

/**
 * Updates an existing contact's properties (partial update).
 *
 * @param {string|number} contactId
 * @param {object} properties - Only the properties to change.
 * @returns {Promise<object>} The updated contact.
 */
async function updateHubSpotContact(contactId, properties) {
  return contactRepository.update(contactId, properties);
}

/**
 * Deletes (archives) a contact in HubSpot.
 *
 * @param {string|number} contactId
 * @returns {Promise<boolean>} true if the deletion succeeded.
 */
async function deleteHubSpotContact(contactId) {
  return contactRepository.remove(contactId);
}

/**
 * Lists a single page of deals with their full details, as returned by
 * HubSpot (results + pagination cursor).
 *
 * @param {object} [options]
 * @param {string} [options.after] - Pagination cursor from a previous call.
 * @param {number} [options.limit] - Page size (HubSpot max is 100).
 * @param {string[]} [options.properties] - Deal properties to include.
 * @returns {Promise<{results: object[], paging?: {next?: {after: string}}}>}
 */
async function getHubSpotDeals({ after, limit, properties } = {}) {
  return dealRepository.findPage({ after, limit, properties });
}

/**
 * Creates a new deal in HubSpot, assigning it to the pipeline/stage
 * configured via HUBSPOT_PIPELINE_ID / HUBSPOT_STAGE_ID env vars.
 *
 * @param {string} dealName
 * @param {number|string} amount
 * @returns {Promise<object>} The created deal, including its HubSpot id.
 */
async function createHubSpotDeal(dealName, amount) {
  const { HUBSPOT_PIPELINE_ID, HUBSPOT_STAGE_ID } = process.env;

  if (!HUBSPOT_PIPELINE_ID || !HUBSPOT_STAGE_ID) {
    throw new Error(
      "Missing HUBSPOT_PIPELINE_ID or HUBSPOT_STAGE_ID environment variable. Check your .env file."
    );
  }

  return dealRepository.create({
    dealname: dealName,
    amount,
    pipeline: HUBSPOT_PIPELINE_ID,
    dealstage: HUBSPOT_STAGE_ID,
  });
}

/**
 * Updates an existing deal's properties (partial update).
 *
 * @param {string|number} dealId
 * @param {object} properties - Only the properties to change.
 * @returns {Promise<object>} The updated deal.
 */
async function updateHubSpotDeal(dealId, properties) {
  return dealRepository.update(dealId, properties);
}

/**
 * Deletes (archives) a deal in HubSpot.
 *
 * @param {string|number} dealId
 * @returns {Promise<boolean>} true if the deletion succeeded.
 */
async function deleteHubSpotDeal(dealId) {
  return dealRepository.remove(dealId);
}

module.exports = {
  getHubSpotContactNames,
  getHubSpotContacts,
  createHubSpotContact,
  updateHubSpotContact,
  deleteHubSpotContact,
  getHubSpotDeals,
  createHubSpotDeal,
  updateHubSpotDeal,
  deleteHubSpotDeal,
};
