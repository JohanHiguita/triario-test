require("dotenv").config();
const axios = require("axios");
const { handleHubSpotErrors } = require("../utils/handleHubSpotErrors");

const { HUBSPOT_ACCESS_TOKEN } = process.env;

if (!HUBSPOT_ACCESS_TOKEN) {
  throw new Error(
    "Missing HUBSPOT_ACCESS_TOKEN environment variable. Check your .env file."
  );
}

/**
 * Central Axios instance for all HubSpot API calls.
 * Base URL and auth header are configured once here so repositories/services
 * don't need to repeat them on every request.
 */
const hubSpotClient = axios.create({
  baseURL: "https://api.hubapi.com",
  timeout: 10000, // avoid requests hanging indefinitely on network stalls
  headers: {
    Authorization: `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
    "Content-Type": "application/json",
  },
});

// Normalizes/logs errors and retries with exponential backoff on 429/5xx.
hubSpotClient.interceptors.response.use((response) => response, handleHubSpotErrors);

module.exports = hubSpotClient;
