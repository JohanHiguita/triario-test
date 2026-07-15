/**
 * Thrown when a payload/argument fails validation before a request is ever
 * sent to HubSpot (see validateHubSpotPayload.js). Signals a caller mistake
 * (bad input), as opposed to a HubSpot API error - never worth retrying.
 */
class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "ValidationError";
  }
}

/**
 * Thrown when HubSpot's API itself returns an error response (or the request
 * fails at the network/timeout level). Wraps the relevant details from the
 * underlying Axios error so callers don't need to know it's Axios under the
 * hood. `statusCode` is `undefined` for network errors/timeouts (no response
 * was ever received).
 */
class HubSpotApiError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.name = "HubSpotApiError";
    this.statusCode = statusCode;
  }
}

module.exports = { ValidationError, HubSpotApiError };
