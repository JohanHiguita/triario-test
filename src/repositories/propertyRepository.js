const hubSpotClient = require("../clients/hubSpotClient");

/**
 * Checks whether a property already exists for a given object type.
 * GET /crm/v3/properties/{objectType}/{propertyName}
 *
 * @param {string} objectType - e.g. "deals"
 * @param {string} propertyName
 * @returns {Promise<boolean>}
 */
async function exists(objectType, propertyName) {
  try {
    await hubSpotClient.get(`/crm/v3/properties/${objectType}/${propertyName}`);
    return true;
  } catch (error) {
    if (error.response?.status === 404) {
      return false;
    }

    throw error;
  }
}

/**
 * Creates a new property definition for a given object type.
 * POST /crm/v3/properties/{objectType}
 *
 * @param {string} objectType - e.g. "deals"
 * @param {object} definition - e.g. { name, label, type, fieldType, groupName, hasUniqueValue }.
 * @returns {Promise<object>} The created property definition.
 */
async function create(objectType, definition) {
  const response = await hubSpotClient.post(`/crm/v3/properties/${objectType}`, definition);
  return response.data;
}

/**
 * Creates a property only if it doesn't already exist. Safe to call more
 * than once (idempotent).
 *
 * @param {string} objectType - e.g. "deals"
 * @param {object} definition - e.g. { name, label, type, fieldType, groupName, hasUniqueValue }.
 * @returns {Promise<{created: boolean}>}
 */
async function ensureExists(objectType, definition) {
  const alreadyExists = await exists(objectType, definition.name);

  if (alreadyExists) {
    return { created: false };
  }

  await create(objectType, definition);
  return { created: true };
}

module.exports = { exists, create, ensureExists };
