# Frontend Run Guide

## Install dependencies

From the frontend folder:

```bash
npm install
```

## Start the development server

```bash
npm run dev
```

Then open the local Vite URL shown in the terminal.

## Build for production

```bash
npm run build
```

## Mock mode
- Set `VITE_USE_MOCK_API=true` to use the existing mock-auth experience.

## Real backend mode
- Set `VITE_USE_MOCK_API=false` to connect the frontend to the Spring Boot backend.
- The frontend will call `/api/auth/login`, `/api/auth/register`, `/api/auth/me`, and the role-based dashboard endpoints.

## Demo accounts
- Admin (seeded backend account): admin@marketplace.com / Admin@123
- Provider and consumer accounts can be created through the register flow.
