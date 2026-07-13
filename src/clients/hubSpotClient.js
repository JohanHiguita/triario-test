require("dotenv").config();
const axios = require("axios");

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
  headers: {
    Authorization: `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
    "Content-Type": "application/json",
  },
});

module.exports = hubSpotClient;
