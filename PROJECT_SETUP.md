# FinWise AI Project Setup

## Run Locally

```bash
npm run setup
npm run frontend
npm run backend
```

- Frontend app: http://localhost:3000
- Backend API: http://localhost:5001
- Offline demo mode is enabled with `VITE_OFFLINE=true` in `frontend/.env`.

## Verify Before Deployment

```bash
npm run verify
```

This runs lint, production build, and backend tests.

## Demo-Ready Frontend Modules

- Authentication shell with offline auto-login
- Dashboard with balance, income, expenses, savings, charts, and AI insights
- Income and expense tracking
- Budget planner
- Savings goals
- Loan and EMI tracking
- Investment tracker
- Vehicle expenses
- Bills reminder
- Reports export screen
- AI chat assistant prototype
- Analytics and financial health score
- Notifications and settings
- Admin panel prototype

## Backend Foundation

- Node.js and Express API
- JWT auth services
- Google login route foundation
- WebAuthn/passkey route foundation
- Supabase client and database schema
- Finance analytics service

## Next Build Steps

1. Add real Supabase credentials in `backend/.env`.
2. Run `backend/database/schema.sql` in Supabase.
3. Convert prototype-only modules into database-backed CRUD routes.
4. Add OpenAI API integration for AI chat, receipt scanning, and monthly reports.
5. Add real PDF/CSV/Excel export generation.
6. Migrate frontend to TypeScript when the feature surface is stable.
