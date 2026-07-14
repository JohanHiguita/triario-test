/**
 * Validates the pagination/query options sent to HubSpot's list endpoints
 * (e.g. GET /crm/v3/objects/contacts) before the request is built, so we fail
 * fast with a clear message instead of letting HubSpot reject a malformed request.
 *
 * @param {object} options
 * @param {string} [options.after]
 * @param {number} [options.limit]
 * @param {string[]} [options.properties]
 */
function validatePaginationOptions({ after, limit, properties }) {
  if (limit !== undefined) {
    const isValidLimit =
      typeof limit === "number" && Number.isInteger(limit) && limit >= 1 && limit <= 100;

    if (!isValidLimit) {
      throw new Error('"limit" must be an integer between 1 and 100');
    }
  }

  if (properties !== undefined) {
    const isValidProperties =
      Array.isArray(properties) && properties.every((p) => typeof p === "string");

    if (!isValidProperties) {
      throw new Error('"properties" must be an array of strings');
    }
  }

  if (after !== undefined && typeof after !== "string") {
    throw new Error('"after" must be a string');
  }
}

/**
 * Validates the "properties" object sent when creating/updating any HubSpot
 * object (contacts, deals, etc.). Only checks the generic shape HubSpot
 * expects (a non-empty plain object) — it does not enforce which specific
 * fields must be present, since that varies per object type and HubSpot
 * itself doesn't require any particular one.
 *
 * @param {object} properties
 */
function validateProperties(properties) {
  const isPlainObject =
    typeof properties === "object" &&
    properties !== null &&
    !Array.isArray(properties);

  if (!isPlainObject || Object.keys(properties).length === 0) {
    throw new Error('"properties" must be a non-empty object');
  }
}

/**
 * Validates an object id used in path parameters (e.g. contactId, dealId)
 * before it's interpolated into a HubSpot URL.
 *
 * @param {string|number} id
 */
function validateObjectId(id) {
  const isValidId =
    (typeof id === "string" && id.trim().length > 0) ||
    (typeof id === "number" && Number.isFinite(id)); 

  if (!isValidId) {
    throw new Error('"id" must be a non-empty string or a number');
  }
}

module.exports = {
  validatePaginationOptions,
  validateProperties,
  validateObjectId,
};
