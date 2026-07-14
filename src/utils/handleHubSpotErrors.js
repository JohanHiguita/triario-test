const axios = require("axios");

const MAX_RETRIES = 3;
const RETRYABLE_STATUS_CODES = new Set([429, 500, 502, 503, 504]);

/**
 * Exponential backoff delay in ms for a given attempt number (0-indexed):
 * attempt 0 -> 1000ms, attempt 1 -> 2000ms, attempt 2 -> 4000ms.
 *
 * @param {number} attempt
 * @returns {number}
 */
function calculateBackoffDelay(attempt) {
  return 2 ** attempt * 1000;
}

/**
 * Logs an API error without exposing sensitive data (auth headers, tokens).
 * Only method, URL, status and HubSpot's own error message are logged.
 *
 * @param {import('axios').AxiosError} error
 */
function logError(error) {
  console.error("HubSpot API error:", {
    method: error.config?.method?.toUpperCase(),
    url: error.config?.url,
    status: error.response?.status ?? "no response (network error/timeout)",
    message: error.response?.data?.message || error.message,
  });
}

/**
 * Axios response interceptor: normalizes and logs HubSpot API errors, and
 * retries with exponential backoff on 429 (rate limit) and 5xx (server
 * errors). Authentication errors (401/403) and other 4xx (validation, etc.)
 * are not retried, since retrying would fail again for the same reason.
 * Network errors/timeouts (no response received) are also not retried here.
 *
 * @param {import('axios').AxiosError} error
 * @returns {Promise<never>}
 */
async function handleHubSpotErrors(error) {
  const { config, response } = error;
  const attempt = config?.__retryCount || 0;
  const isRetryableStatus = response && RETRYABLE_STATUS_CODES.has(response.status);

  if (isRetryableStatus && attempt < MAX_RETRIES) {
    config.__retryCount = attempt + 1;

    const retryAfterHeader = response.headers?.["retry-after"];
    const delay = retryAfterHeader
      ? Number(retryAfterHeader) * 1000
      : calculateBackoffDelay(attempt);

    console.warn(
      `HubSpot request failed with ${response.status}. Retrying in ${delay}ms ` +
        `(attempt ${config.__retryCount}/${MAX_RETRIES})...`
    );

    await new Promise((resolve) => setTimeout(resolve, delay)); // wait for the delay before retrying

    return axios(config).catch(handleHubSpotErrors); // retry the request
  }

  logError(error);
  return Promise.reject(error);
}

module.exports = { handleHubSpotErrors, calculateBackoffDelay };
