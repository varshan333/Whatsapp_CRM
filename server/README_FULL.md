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
--------------------------

- Express.js: lightweight, widely used web framework.
- MongoDB + Mongoose: fast iteration for the data model you provided (documents map naturally to your schema). Models are defined in `server/src/models.js`.
- JWT for access tokens: issued on login/signup, carried by Authorization: Bearer <token> header.
- Refresh tokens as signed JWT stored in httpOnly cookie: rotated on `/api/auth/refresh` and persisted in DB for revocation.
- Zod for strong request validation.
- bcryptjs for password hashing.
- Helmet and express-rate-limit for basic hardening.

Implemented features & endpoints
-------------------------------

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

Database models (MongoDB via Mongoose)
--------------------------------------

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

Security considerations (what's already done)
-------------------------------------------

- Passwords hashed with bcrypt before persisting.
- Access tokens are JWTs signed with `JWT_ACCESS_TOKEN_SECRET` and intended short-lived (controlled by `ACCESS_TOKEN_EXPIRY`). Keep this short (e.g., 5–15 minutes).
- Refresh tokens are signed JWTs stored in a httpOnly cookie (`refreshToken`) and persisted server-side (the `RefreshToken` collection). The server rotates refresh tokens on `/refresh` and marks the old token revoked.
- Cookies: httpOnly, SameSite=lax (configurable with `COOKIE_SECURE` and `COOKIE_DOMAIN` env vars). Set `COOKIE_SECURE=true` in production (requires HTTPS).
- Rate limiting applied globally (configurable in `src/index.js`) to mitigate brute force attempts.
- Input validation performed via Zod — requests are rejected with 400 when validation fails.

Important caveats
- Reset tokens are stored on the `User` document (plain string). For extra security in production, store only a hash of the reset token and index the expiry. That prevents token theft from the DB.
- Access tokens are not stored server-side (stateless). If you need immediate forced logout you should implement token revocation lists or reduce access token TTL and rely on refresh token revocation.

Environment variables
---------------------

Copy `.env.example` to `.env` and set these values before running:

- PORT — server port (default 4000)
- MONGODB_URI — MongoDB connection string (e.g., mongodb://localhost:27017)
- JWT_ACCESS_TOKEN_SECRET — strong random secret for access tokens
- JWT_REFRESH_TOKEN_SECRET — strong random secret for refresh tokens
- ACCESS_TOKEN_EXPIRY — e.g., "900s" or "15m"
- REFRESH_TOKEN_EXPIRY — e.g., "7d"
- COOKIE_DOMAIN — domain for refresh cookie (e.g., localhost)
- COOKIE_SECURE — true in production when using HTTPS; false for local dev

How to run (local development)
------------------------------

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

Example requests
----------------

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

Migration to production (checklist)
---------------------------------

- Use a managed DB (MongoDB Atlas or self-hosted with backups).
- Set `COOKIE_SECURE=true` and run server behind HTTPS/Load balancer.
- Replace console email sending with a real provider (SendGrid, SES) and template management.
- Hash password reset tokens before storing and set TTL indexes on expiry fields.
- Add monitoring, structured logging, and alerting.
- Add integration tests and CI checks for auth flows (rotation, revocation).
- Enable strict CORS policy with your frontend origin(s).
- Consider storing refresh tokens hashed and using token identifiers for rotation/replay detection.

Next steps I can implement for you
---------------------------------

- Seed script: create an initial `Client` and Admin `User` for testing.
- Endpoints: implement CRUD for Leads, Conversations, Messages and Templates.
- Email integration: plug in SendGrid/SES and production-ready reset email templates.
- Tests: add Jest supertest integration tests for auth flows.
- Migrate to Prisma + Postgres if you prefer relational DB for joins and transactions.

If you want, I can now implement a seed script to create a client + admin user so you can log in from the frontend immediately. Tell me which next step you prefer.

---

File references
- `server/src/index.js` — server entrypoint
- `server/src/routes/auth.js` — auth API handlers
- `server/src/models.js` — Mongoose models mapping to your schema
- `server/src/db.js` — DB connection helper
- `server/src/utils/email.js` — email placeholder (currently logs reset link)
