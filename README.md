# NodeJS - Hubspot CRM Integration

Dev: Johan Higuita

## Table of contents

- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [Setup](#setup)
- [HubSpot Private App configuration](#hubspot-private-app-configuration)
- [Available scripts](#available-scripts)
- [HubSpot endpoints used (official docs)](#hubspot-endpoints-used-official-docs)
- [Error handling](#error-handling)
- [Node.js fundamentals](#nodejs-fundamentals)
- [Technical decisions](#technical-decisions)

## Tech stack

- **Node.js** (CommonJS modules).
- **[axios](https://www.npmjs.com/package/axios)** — HTTP client used to call the HubSpot REST API directly, instead of the official `@hubspot/api-client` SDK. See [Technical decisions](#technical-decisions) (Decision 1) for the reasoning.
- **[dotenv](https://www.npmjs.com/package/dotenv)** — loads credentials and configuration from a local `.env` file into `process.env`.

No other runtime dependencies are used.

## Project structure

```
src/
  clients/         # Axios instance configured for HubSpot (base URL, auth header, error interceptor)
  repositories/     # One repository per HubSpot object type; only layer that knows the HTTP endpoints/shape
  services/         # Orchestrator (hubSpotService): business logic, composes repositories
  utils/            # Cross-cutting utilities: payload validation, error handling/retries
  fundamentals/     # Standalone Node.js fundamentals exercises (callbacks, promises, modules, streams)
  examples/         # Executable scripts that exercise the service layer end-to-end, with console output
  data/             # Local JSON sample data used by the sync examples
```

**Why this structure?** It separates concerns by responsibility instead of putting everything in one file:

- `clients` only knows _how to talk_ to HubSpot (base URL, auth, retries) — it doesn't know about contacts or deals.
- `repositories` only knows _the shape of each HubSpot object's endpoints_ (contacts, deals, associations, properties) — no business logic.
- `services` (`hubSpotService`) is the only layer that applies business rules (e.g. pipeline defaults, sync semantics) and is what `examples` scripts call into.
- `examples` are thin, presentational scripts (console output only) — they never talk to HubSpot directly, they always go through `hubSpotService`.

This keeps each layer independently testable/replaceable (e.g. swapping axios for the official SDK would only require changing `clients` and `repositories`, not `services` or `examples`).

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the environment template and fill in your own values:

   ```bash
   cp .env.example .env
   ```

   | Variable               | Description                                                           |
   | ---------------------- | --------------------------------------------------------------------- |
   | `HUBSPOT_ACCESS_TOKEN` | Private App access token (see below). Never commit this.              |
   | `HUBSPOT_PIPELINE_ID`  | Internal ID of the deal pipeline used as default when creating deals. |
   | `HUBSPOT_STAGE_ID`     | Internal ID of the deal stage used as default when creating deals.    |

   `.env` is git-ignored; `.env.example` is the committed template with placeholder values only.

3. Run any script from the [Available scripts](#available-scripts) section, e.g.:

   ```bash
   npm run contacts:list-names
   ```

> **Portal used for testing:** this integration was built and tested against a personal HubSpot **developer test account/portal** (Private App, described below), Hub ID / Portal ID `51733430`. 

## HubSpot Private App configuration

HubSpot exposes two ways to authenticate a server-to-server integration: a **Private App token** or a **legacy API Key**. This project uses a **Private App token** (the API Key model is deprecated by HubSpot for new integrations). See the official [Private Apps guide](https://developers.hubspot.com/docs/apps/legacy-apps/private-apps/overview) for full details.

1. In the HubSpot account, go to **Settings > Integrations > Private Apps**.
2. Click **Create a private app**, give it a name/description.
3. On the **Scopes** tab, enable the scopes listed below.
4. Save, then copy the generated access token from the **Auth** tab into `HUBSPOT_ACCESS_TOKEN` in `.env`.
5. The token is sent as `Authorization: Bearer <token>` on every request (configured once in `src/clients/hubSpotClient.js`).

### Scopes enabled on the Private App

| Scope                        | Needed for                                                                          |
| ---------------------------- | ----------------------------------------------------------------------------------- |
| `crm.objects.contacts.read`  | Listing/reading contacts                                                            |
| `crm.objects.contacts.write` | Create/update/delete/upsert contacts                                                |
| `crm.objects.deals.read`     | Listing/reading deals                                                               |
| `crm.objects.deals.write`    | Create/update/delete/upsert deals, associations                                     |
| `crm.schemas.deals.write`    | Creating the custom `external_deal_id` property used for deal sync (see Decision 6) |

## Available scripts

All scripts are runnable via `npm run <script>` and produce console output describing the result. Scripts that need an argument (a HubSpot record id) read it from the CLI via `npm run <script> -- <arg>`.

### Node.js fundamentals

| Script                             | Runs                             | What it demonstrates                                                                                           |
| ---------------------------------- | -------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `npm run fundamentals:callbacks`   | `src/fundamentals/callbacks.js`  | Async operation via `setTimeout` using the Node.js error-first callback pattern.                               |
| `npm run fundamentals:async-await` | `src/fundamentals/asyncAwait.js` | Same operation refactored to return a Promise, consumed with `async/await`.                                    |
| `npm run fundamentals:modules`     | `src/fundamentals/main.js`       | CommonJS modules: `main.js` imports (`require`) a function exported (`module.exports`) from `utils_module.js`. |
| `npm run fundamentals:streams`     | `src/fundamentals/streams.js`    | Streams: `Readable.from(...)` piped through a `Transform` (uppercase) into `process.stdout`.                   |

### Contacts

| Script                                   | Runs                                 | What it does                                                                                                    |
| ---------------------------------------- | ------------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| `npm run contacts:list-names`            | `src/examples/list-contact-names.js` | Calls `getHubSpotContactNames()`; paginates through **all** contacts and prints each full name.                 |
| `npm run contacts:list`                  | `src/examples/list-contacts.js`      | Calls `getHubSpotContacts()`; prints a single page of contacts with their properties and the pagination cursor. |
| `npm run contacts:create`                | `src/examples/create-contact.js`     | Calls `createHubSpotContact()`; creates one hardcoded sample contact.                                           |
| `npm run contacts:update -- <contactId>` | `src/examples/update-contact.js`     | Calls `updateHubSpotContact()`; updates `lastname` on the given contact id.                                     |
| `npm run contacts:delete -- <contactId>` | `src/examples/delete-contact.js`     | Calls `deleteHubSpotContact()`; archives the given contact.                                                     |
| `npm run contacts:sync`                  | `src/examples/sync-contacts.js`      | Calls `syncContactsWithHubSpot()`; upserts every record in `src/data/contacts.json` by `email`.                 |

### Deals

| Script                             | Runs                                  | What it does                                                                                                                                                          |
| ---------------------------------- | ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run deals:setup-property`     | `src/examples/setup-deal-property.js` | One-time setup: idempotently creates the custom `external_deal_id` unique property on the Deal object (required for `deals:sync`). Run this once before `deals:sync`. |
| `npm run deals:list`               | `src/examples/list-deals.js`          | Calls `getHubSpotDeals()`; prints a single page of deals with their properties and the pagination cursor.                                                             |
| `npm run deals:create`             | `src/examples/create-deal.js`         | Calls `createHubSpotDeal(dealName, amount)`; creates one hardcoded sample deal using the pipeline/stage from `.env`.                                                  |
| `npm run deals:update -- <dealId>` | `src/examples/update-deal.js`         | Calls `updateHubSpotDeal()`; updates `dealname` on the given deal id.                                                                                                 |
| `npm run deals:delete -- <dealId>` | `src/examples/delete-deal.js`         | Calls `deleteHubSpotDeal()`; archives the given deal.                                                                                                                 |
| `npm run deals:sync`               | `src/examples/sync-deals.js`          | Calls `syncDealsWithHubSpot()`; upserts every record in `src/data/deals.json` by `external_deal_id`. Requires `deals:setup-property` to have been run first.          |

### Associations

| Script                                                         | Runs                                        | What it does                                                                                                       |
| -------------------------------------------------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `npm run associations:contact-to-deal -- <contactId> <dealId>` | `src/examples/associate-contact-to-deal.js` | Calls `associateContactToDeal()`; creates the default association between the given contact and deal (idempotent). |

## HubSpot endpoints used (official docs)

| Functionality                                  | Endpoint                                                                                              | Docs                                                                                                                                          |
| ---------------------------------------------- | ----------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| List/paginate contacts                         | `GET /crm/v3/objects/contacts`                                                                        | [Retrieve contacts](https://developers.hubspot.com/docs/api-reference/latest/crm/objects/contacts/get-contacts)                               |
| Create contact                                 | `POST /crm/v3/objects/contacts`                                                                       | [Create a contact](https://developers.hubspot.com/docs/api-reference/latest/crm/objects/contacts/create-contact)                              |
| Update contact                                 | `PATCH /crm/v3/objects/contacts/{contactId}`                                                          | [Update a contact](https://developers.hubspot.com/docs/api-reference/latest/crm/objects/contacts/update-contact)                              |
| Delete (archive) contact                       | `DELETE /crm/v3/objects/contacts/{contactId}`                                                         | [Delete a contact](https://developers.hubspot.com/docs/api-reference/latest/crm/objects/contacts/delete-contact)                              |
| Batch upsert contacts (sync)                   | `POST /crm/v3/objects/contacts/batch/upsert`                                                          | [Upsert contacts](https://developers.hubspot.com/docs/api-reference/latest/crm/objects/contacts/batch/upsert-contacts)                        |
| List/paginate deals                            | `GET /crm/v3/objects/deals`                                                                           | [Retrieve deals](https://developers.hubspot.com/docs/api-reference/latest/crm/objects/deals/get-deals)                                        |
| Create deal                                    | `POST /crm/v3/objects/deals`                                                                          | [Create a deal](https://developers.hubspot.com/docs/api-reference/latest/crm/objects/deals/create-deal)                                       |
| Update deal                                    | `PATCH /crm/v3/objects/deals/{dealId}`                                                                | [Update a deal](https://developers.hubspot.com/docs/api-reference/latest/crm/objects/deals/update-deal)                                       |
| Delete (archive) deal                          | `DELETE /crm/v3/objects/deals/{dealId}`                                                               | [Delete a deal](https://developers.hubspot.com/docs/api-reference/latest/crm/objects/deals/delete-deal)                                       |
| Batch upsert deals (sync)                      | `POST /crm/v3/objects/deals/batch/upsert`                                                             | [Upsert deals](https://developers.hubspot.com/docs/api-reference/latest/crm/objects/deals/batch/upsert-deals)                                 |
| Create custom property (`external_deal_id`)    | `POST /crm/v3/properties/deals`                                                                       | [Create a property](https://developers.hubspot.com/docs/api-reference/latest/crm/properties/create-property)                                  |
| Associate contact ↔ deal (default, idempotent) | `PUT /crm/v4/objects/contacts/{contactId}/associations/default/deals/{dealId}`                        | [Associate records (default)](https://developers.hubspot.com/docs/api-reference/latest/crm/associations/associate-records/update-association) |

Rate limits and pagination were handled per HubSpot's general guidance in [Understanding the CRM (Using object APIs)](https://developers.hubspot.com/docs/guides/crm/using-object-apis).

## Error handling

Implemented in `src/utils/handleHubSpotErrors.js`, registered as an Axios response interceptor on `hubSpotClient` (`src/clients/hubSpotClient.js`), so every HubSpot call is covered without repeating `try/catch` boilerplate per call:

- **Network errors / timeouts**: `hubSpotClient` sets a 10s request timeout (no HTTP response at all after that, or a connection failure), not retried automatically here; propagated to the caller so `examples` scripts can report them via their own `try/catch`.
- **401 (invalid/expired token) and 403 (missing scope)**: not retried — retrying the same request would fail again for the same reason. Logged and re-thrown.
- **Other 4xx (validation, conflicts, etc.)**: not retried, for the same reason. Payloads are additionally checked _before_ the request is sent (see `src/utils/validateHubSpotPayload.js`) to fail fast on obviously invalid input (bad `limit`, missing required properties, etc.), raising a `ValidationError` instead of a generic `Error`.
- **429 (rate limit)**: retried, honoring HubSpot's `Retry-After` response header when present, falling back to exponential backoff (`2^attempt * 1000ms`) otherwise. Up to 3 attempts.
- **5xx**: a curated subset (`500`, `502`, `503`, `504`) is retried with the same backoff strategy — see Decision 7 for why the rest of the 5xx range is intentionally excluded.
- **Safe logging**: `logError()` only logs method, URL, HTTP status, and HubSpot's own error message — never headers, tokens, or request bodies.
- **Custom error classes** (`src/utils/errors.js`): validation failures raise `ValidationError`; once retries (if any) are exhausted, any HubSpot API/network failure is rejected as `HubSpotApiError` (with a `statusCode`, `undefined` for network errors/timeouts) instead of the raw Axios error, so callers can do `err instanceof ValidationError` / `err instanceof HubSpotApiError` without depending on Axios's error shape.

Every repository/service function is still wrapped in the caller's `try/catch` at the `examples` layer, so failures are reported per-script instead of crashing the process.

## Node.js fundamentals

Covered as standalone exercises in `src/fundamentals/`, independent from the HubSpot integration:

- **Callbacks** (`callbacks.js`): error-first callback pattern over a `setTimeout`-simulated async operation.
- **Promises / async-await** (`asyncAwait.js`): the same operation refactored to return a `Promise`, consumed with `async/await`.
- **CommonJS modules** (`utils_module.js` + `main.js`): `module.exports` / `require` between two files.
- **Streams** (`streams.js`): `Readable.from([...])` piped through a `Transform` stream (uppercase) into `process.stdout`.

## Technical decisions

1. **Axios instead of the official `@hubspot/api-client` SDK** — chosen to demonstrate direct understanding of the REST API (request shape, headers, pagination) rather than relying on SDK abstractions.
2. **Repository pattern** — one repository per HubSpot object type, isolating HTTP/endpoint details from the business logic in `hubSpotService`.
3. **`getHubSpotContacts` uses the list endpoint, not search** — pagination and property selection satisfy "filter/pagination options" as requested; the search endpoint (`/search`, with `filterGroups`) was out of scope and would be a separate function if ever needed.
4. **Associations use the v4 "default" endpoint**, while Contacts/Deals CRUD stays on v3 — intentional, not inconsistent: HubSpot versions endpoints per resource family, and v4 associations resolve the association type automatically and are idempotent by design (calling it twice doesn't duplicate the association).
5. **`syncContactsWithHubSpot` uses the batch upsert endpoint** with `idProperty: "email"` instead of a manual "check then create/update" loop — it's HubSpot's own documented idempotent-sync pattern, and processes up to 100 records per request. The function receives the contacts array as a parameter (read from `src/data/contacts.json` one layer up, in the example script) to keep the service decoupled from the filesystem.
6. **`syncDealsWithHubSpot` uses the same batch upsert pattern**, but deals have no built-in unique identifier like `email`. A custom `external_deal_id` property (`hasUniqueValue: true`) was created via the Properties API instead of matching by `dealname` (not guaranteed unique). Known limitation: deals created before this property existed are not reconciled by the sync — this is expected for an upsert-by-unique-property approach, not a bug.
7. **`handleHubSpotErrors` retries only `429, 500, 502, 503, 504`**, not the full 5xx range — these codes describe transient, infrastructure-level failures that can plausibly succeed on retry. Any other 5xx code outside this curated set (`501`, `505`, etc., used here only as representative examples) describes a permanent mismatch between the request and what the server supports, so retrying it would fail again identically and just add latency. This is narrower than HubSpot's official Node SDK (which retries any 5xx), by deliberate choice for clarity.
