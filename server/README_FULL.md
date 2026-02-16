# WhatsApp CRM — Server (Comprehensive README)

This document describes the server-side scaffold included in the `server/` directory, how it maps to your DB schema, what endpoints are implemented, the security posture, how to run it locally, and recommended next steps for production readiness.

Table of contents
- Overview
- Architecture & tech choices
- Implemented features & endpoints
- Database models (MongoDB via Mongoose)
- Security considerations
- Environment variables
- How to run (local)
- Example requests
- Migration to production (checklist)
- Next steps

Overview
--------

The `server/` folder contains a minimal Express.js backend written in JavaScript that implements a secure, production-oriented authentication flow and data models for the WhatsApp CRM. The scaffold was created to support the Next.js frontend in this repository and to provide a clear, secure starting point for expanding backend functionality.

The server includes:
- JWT-based authentication (short-lived access token + long-lived refresh token stored as a httpOnly cookie)
- Refresh token rotation and server-side revocation
- Password hashing (bcrypt)
- Password reset flow (token generation + emailed link — currently logged to console by default)
- Input validation (Zod)
- Rate limiting and Helmet security headers
- MongoDB persistence via Mongoose (models created from your provided schema)

Architecture & tech choices
```markdown
# WhatsApp CRM — Server (Comprehensive README)

This README has two top-level sections:

1. Changes in this sprint (what we implemented, partial work, and what remains)
   - 1.1 Implemented / completed items
   - 1.2 Partial implementations
   - 1.3 Not implemented yet
   - 1.4 Files added / changed in this iteration

2. Reference: original README content (preserved & re-numbered)
   - 2.1 Overview
   - 2.2 Architecture & tech choices
   - 2.3 Implemented features & endpoints (original)
   - 2.4 Database models
   - 2.5 Security considerations
   - 2.6 Environment variables
   - 2.7 How to run (local)
   - 2.8 Example requests
   - 2.9 Migration to production

Use the numbered sections above to quickly find what was changed in the back-end during the recent sprint and to reference the prior, unchanged documentation (moved under section 2).

## 1. Changes in this sprint

This section documents the concrete backend work completed during the latest update. Where functionality is incomplete it is marked as PARTIAL or NOT IMPLEMENTED.

### 1.1 Implemented / completed items

- Added JWT + refresh-token based auth flow (rotation + revocation) — existing but validated and left in place.
- Implemented authentication middleware and role-based authorization middleware (`server/src/middleware/auth.js`).
- Added Redis connection (`server/src/redis.js`) and a simple Redis-backed queue (`server/src/queue.js`).
- Added a WhatsApp provider scaffold for template sending (`server/src/providers/whatsapp.js`) with a best-effort send implementation. (Needs credentials and verification for production.)
- Implemented webhook endpoint to receive incoming provider events and process provider delivery/read receipts. The webhook now:
  - recognizes common provider shapes (Meta-style `entry[].changes[].value.statuses`, `messages` arrays, or top-level status arrays),
  - maps provider status strings to the internal enum (`sent`, `delivered`, `read`, `failed`, `unknown`),
  - finds the local `Message` by `providerMessageId`, updates `Message.status` idempotently, and appends a `{ status, timestamp, raw }` entry to `Message.statusHistory` for auditability,
  - continues to enqueue non-status inbound messages for async processing.
  Endpoint: `POST /webhook/incoming` (`server/src/routes/webhook.js`).
- Implemented outbound enqueue + immediate best-effort send flow for template messages: `POST /api/messages/template` (`server/src/routes/messages.js`).
- Added CRUD endpoints (secure) for core resources:
  - Leads: `server/src/routes/leads.js` (create/list/get/update/delete)
  - Conversations: `server/src/routes/conversations.js` (list/get/status/assign)
  - Messages: `server/src/routes/messages.js` (list and send template)
  - Templates: `server/src/routes/templates.js` (create/list)
  - Clients: `server/src/routes/clients.js` (create/list)
  - Users: `server/src/routes/users.js` (create/list for admins)
- Added DB indexes and a TTL index for refresh tokens in `server/src/models.js` to improve query performance and to auto-clean rotated tokens.
- Extended `Message` model with `providerMessageId` (indexed) and `statusHistory` (array of `{status,timestamp,raw}`) to support provider receipt tracking and idempotent updates (`server/src/models.js`).
- Mounted routes and added a simple background worker in `server/src/index.js` which consumes the outbound queue and calls the provider scaffold.
- Added test scaffolding and one integration test for auth (signup/login) using Jest + supertest + mongodb-memory-server (`server/tests/auth.test.js`, `server/jest.config.js`).

### 1.2 Partial implementations

- WhatsApp provider integration: scaffolded and able to POST template messages, but
  - signature verification (`verifySignature`) is a placeholder and must be implemented using provider HMAC or verification header rules;
  - retry/backoff and robust error handling need production hardening.
- Inbound webhook processing: webhook events are enqueued; the worker does not yet convert inbound payloads into Lead/Conversation/Message records (that logic needs to be implemented in the worker).
- Tenant enforcement: `clientId` fields exist, but there is not yet global middleware that resolves the request's tenant and enforces filtering for every endpoint.

### 1.3 Not implemented yet (larger features)

- CTA/button UI-to-provider mapping and higher-level business logic for buttons.
- Internal notes API and audit logging for actions.
- Lead auto-creation from inbound messages and automatic assignment flows.
- Contact model separate from Lead (if required), CSV import/validation, group/tag segmentation.
- Bulk campaign engine, scheduling, split testing, pause/resume functionality.
- Bot rule engine, keyword matching, business-hours logic and follow-up scheduler.
- AI integration, request/response logging, AI-driven template selection.
- Analytics aggregation, campaign metrics, and agent performance APIs.
- Full CI/CD, E2E tests, monitoring (Sentry/Prometheus) and production-grade logging.

### 1.4 Files added / changed in this iteration

- `server/package.json` — added test scripts and dependencies (jest, supertest, mongodb-memory-server, ioredis, node-fetch). Please run `npm install` in `server/`.
- `server/src/middleware/auth.js` — authenticate + authorize(role) middleware.
- `server/src/models.js` — indexes added and TTL index for refresh tokens.
- `server/src/redis.js` — Redis client (ioredis).
- `server/src/queue.js` — simple enqueue/dequeue helpers.
- `server/src/providers/whatsapp.js` — provider scaffold for sending templates and signature verification stub.
- `server/src/routes/webhook.js` — incoming webhook route that enqueues provider events.
- `server/src/routes/leads.js` — lead CRUD endpoints.
- `server/src/routes/conversations.js` — conversation list/get/update/assign.
- `server/src/routes/messages.js` — message list and outbound template send endpoint.
- `server/src/routes/templates.js` — template CRUD (admin create + list).
- `server/src/routes/clients.js` — client create/list endpoints.
- `server/src/routes/users.js` — user create/list endpoints for admins.
- `server/src/index_app.js` — express app exported for tests (no listen).
- `server/src/index.js` — server startup + background worker (mounts routes and starts worker after DB connect).
- `server/tests/auth.test.js` and `server/jest.config.js` — basic auth integration test using in-memory MongoDB.

## 2. Reference: original README (preserved)

The original README content has been preserved below as section 2 for reference. It contains the original longer-form documentation and example requests. Use it for operational instructions and as a reference for the existing endpoints.

### 2.1 Overview

The `server/` folder contains a minimal Express.js backend written in JavaScript that implements a secure, production-oriented authentication flow and data models for the WhatsApp CRM. The scaffold was created to support the Next.js frontend in this repository and to provide a clear, secure starting point for expanding backend functionality.

### 2.2 Architecture & tech choices

- Express.js: lightweight, widely used web framework.
- MongoDB + Mongoose: fast iteration for the data model you provided (documents map naturally to your schema). Models are defined in `server/src/models.js`.
- JWT for access tokens: issued on login/signup, carried by Authorization: Bearer <token> header.
- Refresh tokens as signed JWT stored in httpOnly cookie: rotated on `/api/auth/refresh` and persisted in DB for revocation.
- Zod for strong request validation.
- bcryptjs for password hashing.
- Helmet and express-rate-limit for basic hardening.

### 2.3 Implemented features & endpoints (original)

All endpoints are mounted under `/api` and implemented in `server/src/routes`.

Auth endpoints (implemented)
- POST /api/auth/signup — create account, returns access token and sets refresh cookie.
- POST /api/auth/login — validate credentials, returns access token and sets refresh cookie.
- POST /api/auth/logout — revokes refresh token and clears cookie.
- POST /api/auth/refresh — rotates refresh token and returns new access token (and sets new refresh cookie).
- POST /api/auth/forgot-password — generates a password reset token (stored on user) and sends reset link (currently logs link to console).
- POST /api/auth/reset-password — verify reset token and set new password; revokes existing refresh tokens for user.
- GET  /api/auth/me — returns the current user's profile when called with a valid access token.

Health
- GET /api/health — simple health check (returns { status: 'ok' }).

### 2.4 Database models (MongoDB via Mongoose)

The implementation includes Mongoose models in `server/src/models.js` that map the provided schema. Key models (with notable fields):

- Client
  - _id, companyName, whatsappNumber, businessCategory, timezone, isActive, createdAt
- User
  - _id, clientId, name, email (unique), passwordHash, role (admin|agent), status (active|disabled), createdAt
- RefreshToken
  - tokenId, userId, createdAt, revoked
- Lead
  - clientId, phoneNumber, name, stage, tags, optInStatus, assignedAgentId, createdAt, updatedAt
- Conversation
  - clientId, leadId, assignedAgentId, status (open|pending|closed), lastMessageAt, createdAt
- Message
  - clientId, conversationId, senderType, messageType, content, templateName, status, timestamp
- Template
  - clientId, name, language, content, variables, status, createdAt

The models are intentionally minimal to match your schema and to allow expansion for more fields later.

### 2.5 Security considerations (what's already done)

- Passwords hashed with bcrypt before persisting.
- Access tokens are JWTs signed with `JWT_ACCESS_TOKEN_SECRET` and intended short-lived (controlled by `ACCESS_TOKEN_EXPIRY`). Keep this short (e.g., 5–15 minutes).
- Refresh tokens are signed JWTs stored in a httpOnly cookie (`refreshToken`) and persisted server-side (the `RefreshToken` collection). The server rotates refresh tokens on `/refresh` and marks the old token revoked.
- Cookies: httpOnly, SameSite=lax (configurable with `COOKIE_SECURE` and `COOKIE_DOMAIN` env vars). Set `COOKIE_SECURE=true` in production (requires HTTPS).
- Rate limiting applied globally (configurable in `src/index.js`) to mitigate brute force attempts.
- Input validation performed via Zod — requests are rejected with 400 when validation fails.

### 2.6 Environment variables

Copy `.env.example` to `.env` and set these values before running:

- PORT — server port (default 4000)
- MONGODB_URI — MongoDB connection string (e.g., mongodb://localhost:27017)
- JWT_ACCESS_TOKEN_SECRET — strong random secret for access tokens
- JWT_REFRESH_TOKEN_SECRET — strong random secret for refresh tokens
- ACCESS_TOKEN_EXPIRY — e.g., "900s" or "15m"
- REFRESH_TOKEN_EXPIRY — e.g., "7d"
- COOKIE_DOMAIN — domain for refresh cookie (e.g., localhost)
- COOKIE_SECURE — true in production when using HTTPS; false for local dev

### 2.7 How to run (local development)

1. Install dependencies

```bash
cd server
npm install
```

2. Create `.env` from example and set secrets

```bash
cp .env.example .env
# edit .env to set JWT secrets and MONGODB_URI
```

3. Start a local MongoDB instance (or use a hosted one). For quick local dev you can run MongoDB in Docker:

```bash
docker run -d --name mongo-local -p 27017:27017 mongo:7
```

4. Start the server

```bash
npm run dev
```

You should see logs indicating the server and DB connection are ready.

### 2.8 Example requests

1) Signup

Request:

```bash
curl -X POST http://localhost:4000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Jane Doe","email":"jane@example.com","password":"Secret123!","agreeToTerms":true}'
```

Response: 201 Created — JSON with `accessToken` and sets an httpOnly `refreshToken` cookie.

2) Login

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"jane@example.com","password":"Secret123!"}'
```

3) Use access token to request profile

```bash
curl http://localhost:4000/api/auth/me \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

4) Refresh

From a browser or client that has the httpOnly cookie set, call:

```bash
curl -X POST http://localhost:4000/api/auth/refresh -c cookiejar.txt -b cookiejar.txt
```

Notes about cookies: when testing with curl you need to use cookie jar files (`-c` and `-b`) to persist and send cookies.

### 2.9 Migration to production (checklist)

- Use a managed DB (MongoDB Atlas or self-hosted with backups).
- Set `COOKIE_SECURE=true` and run server behind HTTPS/Load balancer.
- Replace console email sending with a real provider (SendGrid, SES) and template management.
- Hash password reset tokens before storing and set TTL indexes on expiry fields.
- Add monitoring, structured logging, and alerting.
- Add integration tests and CI checks for auth flows (rotation, revocation).
- Enable strict CORS policy with your frontend origin(s).
- Consider storing refresh tokens hashed and using token identifiers for rotation/replay detection.

---

File references (updated)
- `server/package.json` — dependency/test script updates
- `server/src/index.js` — server entrypoint and worker
- `server/src/index_app.js` — app export used in tests
- `server/src/routes/auth.js` — auth API handlers
- `server/src/models.js` — Mongoose models mapping to your schema (indexes added)
- `server/src/redis.js` & `server/src/queue.js` — redis + queue helpers
- `server/src/providers/whatsapp.js` — provider scaffold
- `server/src/routes/*` — routes for leads, conversations, messages, templates, clients, users, webhook
- `server/tests/*` — tests added (auth test)

``` 
