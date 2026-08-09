# Frontend Run Guide

## Prerequisites

1. Make MongoDB Atlas available using the existing backend configuration.
2. Configure the backend's MongoDB and mail settings outside the frontend.
3. Ensure Java/Maven and Node.js/npm are installed.

## Configure API URL

Copy `frontend/.env.example` to `frontend/.env.local` and set:

```dotenv
VITE_API_BASE_URL=http://localhost:8080/api
VITE_USE_MOCK_API=false
```

Do not place MongoDB credentials, JWT secrets, mail credentials, payment secrets, or API keys in this file.

## Start Backend

From the repository root:

```powershell
.\mvnw.cmd spring-boot:run
```

The backend is expected at `http://localhost:8080`.

## Start Frontend

```powershell
Set-Location frontend
npm install
npm run dev
```

Open the Vite URL shown in the terminal, normally `http://localhost:5173`.

## Build

```powershell
npm run build
```

There is no lint script in the imported frontend package.

## Manual Test Order

1. Register a `PROVIDER` or `CONSUMER` account using the backend-supported form.
2. Log in and refresh the browser to verify `/api/auth/me` session restoration.
3. Test provider profile/API operations or consumer marketplace/subscription operations.
4. Use an existing backend-created `ADMIN` account to test admin routes.
5. Verify unauthorized role navigation produces the frontend access-denied state and backend returns 403 for forbidden API calls.
6. Stop Spring Boot and confirm pages show the connection error rather than demo data.
7. Confirm created records remain after restarting the backend and are visible from MongoDB Atlas.

Payments, billing, provider analytics, and admin reporting cannot be tested end to end until matching backend endpoints exist.
