# WhatsApp CRM Frontend
A Next.js application for managing WhatsApp customer relationships.

## Quick Start
1. Install dependencies:
   ```bash
   npm install
   ```
2. Run the development server:
   ```bash
   npm run dev
   ```
3. Open [http://localhost:3000](http://localhost:3000)

## Developer Guide

### For Frontend Team
Your work lives primarily in the UI layers. This is a standard React setup using Next.js App Router.
- **Pages**: `src/app/(portal)/...` and `src/app/(auth)/...`
- **Components**: `src/components/*` 
- **Context/State**: `src/context/*` 

### For Backend Team
**Important**: There is no separate Express server. The backend runs inside Next.js via API Routes.
- **API Endpoints**: `src/app/api/*`
  - Example: `src/app/api/auth/login/route.ts` is your `POST /api/auth/login` endpoint.
- **Database Models**: `src/lib/models.ts`
- **DB Connection**: `src/lib/db.ts`
- **Business Logic**: `src/services/*`
- **Queue/Jobs**: `src/lib/queue.ts`

### Running the App
Command: `npm run dev`
- This code starts **BOTH** the Frontend (React) and the Backend (API routes).
- API runs at `http://localhost:3000/api/...`
- Frontend runs at `http://localhost:3000`