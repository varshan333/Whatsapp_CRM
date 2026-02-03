WhatsApp CRM - Server (Minimal secure scaffold)

This folder contains a minimal TypeScript Fastify server implementing secure auth endpoints to support the frontend in the repo. It's intentionally small, uses in-memory storage for demo, and applies secure defaults (HTTP-only cookies for refresh tokens, helmet, rate limiting, input validation).

What is included:
- Auth endpoints: signup, login, refresh, logout, forgot-password, reset-password, users/me
- Secure defaults: helmet, rate-limiting, cookie configuration, JWT access + refresh token flow
- Input validation via Zod

Run locally (from `server/`):

1. Install dependencies

```bash
npm install
```

2. Copy `.env.example` to `.env` and set secrets

3. Start dev server

```bash
npm run dev
```

Server will run on http://localhost:4000 by default. The frontend can call endpoints under `http://localhost:4000/api/...`.

Notes:
- This is a demo scaffold with in-memory storage. For production, swap storage to a real DB (Postgres), hash tokens server-side, enable secure cookies, and enforce HTTPS.
- I can extend this to use Postgres + TypeORM/Prisma, add migrations, and wire real email sending for forgot-password.
