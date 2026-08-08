# Frontend Overview

This frontend now supports a real Spring Boot authentication flow while preserving the existing UI structure.

## What is included
- Landing page with featured APIs and category highlights
- Login and registration flows connected to `/api/auth/login` and `/api/auth/register`
- Admin, provider, and consumer dashboards connected to the real protected dashboard endpoints
- Role-based protected routing and a development route inventory page
- Material UI styling and a centralized theme system

## Phase 5 integration notes
- The frontend uses a centralized Axios client with token attachment and basic 401/403 handling.
- The default configuration points to the backend at `http://localhost:8080/api`.
- Mock mode remains available via `VITE_USE_MOCK_API=true`, but real mode is now the default in the example environment file.
- Provider, marketplace, consumer subscription, and admin business workflows remain blocked until the backend exposes matching endpoints.
