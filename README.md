# FinWise AI - Finance Tracker

A comprehensive AI-powered personal finance management platform for tracking income, expenses, budgets, savings goals, loans, investments, vehicles, bills, and generating financial insights.

## Features

- **Authentication**: Email/password login, Google OAuth, and Passkeys (WebAuthn) for biometric authentication
- **Dashboard**: Real-time financial health score, income/expense tracking, savings overview
- **Income Tracking**: Log and categorize income sources with detailed analytics
- **Expense Tracking**: Comprehensive expense management with categories and filtering
- **Budgets**: Create and manage budgets with spending limits and progress tracking
- **Savings Goals**: Set financial goals with target amounts and progress monitoring
- **Investments**: Track investment portfolio performance and allocations
- **Bills**: Manage recurring bills with payment reminders
- **Loans**: Track loan details, payments, and payoff progress
- **Vehicles**: Manage vehicle expenses, maintenance, and depreciation
- **Reports & Analytics**: Visual charts and graphs for spending trends and financial patterns
- **AI Insights**: AI-powered financial recommendations and insights

## Technology Stack

### Frontend
- **React 18** with Vite for fast development
- **Tailwind CSS** for modern, responsive styling
- **React Router** for client-side routing
- **Recharts** for data visualization
- **Lucide React** for iconography
- **React Hot Toast** for notifications
- **Supabase JS Client** for database operations

### Backend
- **Node.js** with Express.js
- **Supabase PostgreSQL** database
- **JWT** for secure authentication
- **Google OAuth 2.0** integration
- **WebAuthn** for Passkeys/biometric auth
- **Cloudinary** for image uploads

### Testing
- **Playwright** for end-to-end testing (54 tests)
- **Selenium** with TestNG for cross-browser testing (5 tests)

## Project Architecture

```
Finance Tracker/
├── backend/          # Express.js API server
│   ├── src/         # Source code
│   ├── database/    # SQL schema and migrations
│   └── config/      # Configuration files
├── frontend/        # React + Vite frontend
│   ├── src/         # React components and pages
│   └── public/      # Static assets
├── e2e/            # Playwright E2E tests
├── selenium/       # Selenium Java tests
└── scripts/        # Utility scripts
```

## Database

The application uses **Supabase PostgreSQL** with the following key tables:
- `users` - User accounts and profiles
- `expenses` - Expense records
- `income` - Income records
- `budgets` - Budget allocations
- `savings_goals` - Savings targets
- `investments` - Investment portfolio
- `bills` - Recurring bills
- `loans` - Loan tracking
- `vehicles` - Vehicle management
- `ai_insights` - AI-generated financial insights

## Local Setup

### Prerequisites
- Node.js 18+ and npm
- Supabase account (free tier works)
- Google Cloud Console account (for Google OAuth)

### 1. Clone and Install Dependencies

```bash
cd /Users/pranaybayana/Desktop/Finance\ tracker
npm install
cd backend && npm install
cd ../frontend && npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the schema file:
   ```bash
   backend/database/schema.sql
   ```
3. Copy your Supabase URL and keys from Project Settings > API

### 3. Configure Environment Variables

**Backend** (`backend/.env`):
```bash
PORT=5001
HOST=0.0.0.0
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000,http://localhost:3001

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# WebAuthn
WEBAUTHN_RP_NAME=Finance Tracker
WEBAUTHN_RP_ID=localhost
WEBAUTHN_ORIGIN=http://localhost:3000

# Cloudinary (optional)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

**Frontend** (`frontend/.env`):
```bash
VITE_API_URL=http://localhost:5001/api
VITE_OFFLINE=false
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

See `backend/.env.example` and `frontend/.env.example` for reference.

### 4. Start the Backend

```bash
cd backend
npm start
```

Backend runs on `http://localhost:5001`

### 5. Start the Frontend

```bash
cd frontend
npm run dev
```

Frontend runs on `http://localhost:3001`

### Quick Start (Offline Demo Mode)

To run without backend/auth for testing:

```bash
npm run setup
npm run frontend
```

This uses `VITE_OFFLINE=true` with local-only storage.

## Testing

### Playwright E2E Tests

Playwright tests cover authentication, dashboard, and core user flows.

**Run all Playwright tests:**
```bash
npx playwright test e2e/tests/
```

**Run specific test file:**
```bash
npx playwright test e2e/tests/01-auth.spec.js
```

**Run with UI:**
```bash
npx playwright test e2e/tests/ --ui
```

**View test report:**
```bash
npx playwright show-report
```

**Test Results:**
- Chromium: ✓ 54/54 passed
- Firefox: ✓ 54/54 passed
- WebKit: ✓ 54/54 passed

### Selenium Tests

Selenium tests with TestNG provide additional cross-browser validation.

**Run Selenium tests:**
```bash
cd selenium
mvn test
```

**Test Results:**
- Chrome: ✓ 5/5 passed

### Build Verification

Run the full production readiness check:
```bash
npm run verify
```

This runs:
- Frontend linting
- Backend linting
- Frontend production build
- Backend tests

## Key API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/google` - Google OAuth login
- `POST /api/webauthn/register/options` - Passkey registration options
- `POST /api/webauthn/register/verify` - Verify Passkey registration
- `POST /api/webauthn/login/options` - Passkey login options
- `POST /api/webauthn/login/verify` - Verify Passkey login

### Analytics
- `GET /api/analytics/dashboard` - Dashboard analytics
- `GET /api/analytics/trends` - Monthly trends data
- `GET /api/analytics/insights` - AI insights
- `POST /api/analytics/insights/generate` - Generate new insights

### Core Features
- `GET/POST /api/expenses` - Expense management
- `GET/POST /api/income` - Income tracking
- `GET/POST /api/budgets` - Budget management
- `GET/POST /api/savings-goals` - Savings goals
- `GET/POST /api/investments` - Investment tracking
- `GET/POST /api/bills` - Bill management
- `GET/POST /api/loans` - Loan tracking
- `GET/POST /api/vehicles` - Vehicle management

## Security Notes

- All sensitive data is stored in Supabase with row-level security
- JWT tokens are used for authentication with configurable expiration
- Environment variables are never committed to Git
- Google OAuth and WebAuthn provide secure authentication options
- CORS is configured to allow only specified origins
- Passwords are hashed using bcrypt before storage

## Deployment

### Frontend (Vercel)

1. Connect your GitHub repository to Vercel
2. Set root directory to `frontend`
3. Add environment variables from `frontend/.env`
4. Deploy

The `frontend/vercel.json` file handles React Router rewrites.

### Backend (Render)

1. Connect your GitHub repository to Render
2. Set root directory to `backend`
3. Add environment variables from `backend/.env`
4. Deploy

The `render.yaml` file defines the web service configuration.

### Required Environment Variables for Production

**Backend:**
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `JWT_SECRET`
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- `WEBAUTHN_RP_ID`, `WEBAUTHN_ORIGIN` (match your domain)
- `CORS_ORIGIN` (comma-separated allowed origins)
- `HOST=0.0.0.0`

**Frontend:**
- `VITE_API_URL` (your backend URL)
- `VITE_GOOGLE_CLIENT_ID`
- `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

## Important Notes

- **SMS Transaction Reading**: Not possible in web apps due to browser sandboxing. Consider a React Native companion for this feature.
- **Biometrics**: Implemented via WebAuthn Passkeys, which uses Face/Touch ID where available. Requires HTTPS in production.
- **Offline Mode**: The app supports offline mode with local storage for demo purposes.

## License

This project is provided as-is for educational and personal use.

## Support

For issues, questions, or contributions, please refer to the project repository.
