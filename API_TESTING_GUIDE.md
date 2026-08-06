# API Marketplace Backend Testing Guide

## Overview
This guide describes the implemented Spring Boot backend for the API Marketplace application and documents the actual API surface, authentication requirements, request/response shapes, and recommended test flows.

The backend is implemented in `src/main/java` and uses Spring Boot 3.3, Spring Security, JWT authentication, JPA, Lombok, MapStruct, and SpringDoc OpenAPI.

## Quickstart

### Build
```powershell
cd d:\ApiMarketplace
./mvnw.cmd clean package
```

### Run
```powershell
./mvnw.cmd spring-boot:run
```

The application defaults to:
- Base URL: `http://localhost:8081`
- Swagger UI: `http://localhost:8081/swagger-ui.html`
- OpenAPI JSON: `http://localhost:8081/v3/api-docs`

If port `8081` is already in use, override with:
```powershell
java -jar target\ApiMarketplace-0.0.1-SNAPSHOT.jar --server.port=8082
```

### Tests
```powershell
./mvnw.cmd test
```

## Runtime Configuration
The backend uses the H2 in-memory database by default, as configured in `src/main/resources/application.properties`:
- `spring.datasource.url=jdbc:h2:mem:api_marketplace`
- `spring.jpa.hibernate.ddl-auto=create-drop`

JWT settings:
- `jwt.secret=marketplace-secret-key-1234567890-abcdefghijklmnopqrstuvwxyz`
- `jwt.expiration-ms=86400000`

## Authentication & Authorization

### Public endpoints
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /swagger-ui.html`
- `GET /v3/api-docs/**`

### JWT protection
All remaining endpoints require authentication via `Authorization: Bearer <token>`.

### Role enforcement
- `ConsumerController` (`/api/consumer/**`) requires role `CONSUMER`
- `ProviderController` (`/api/provider/**`) requires role `PROVIDER`
- `DashboardController` admin endpoint requires role `ADMIN`

### Default admin account
The application seeds roles and categories at startup and creates one default admin if missing:
- Email: `admin@marketplace.com`
- Password: `Admin@123`

## Authentication Flow

### Register
`POST /api/auth/register`

Request body:
```json
{
  "fullName": "Alice Consumer",
  "email": "alice@example.com",
  "password": "StrongPassword123",
  "role": "CONSUMER"
}
```

Response body:
```json
{
  "token": "<jwt-token>",
  "type": "Bearer",
  "role": "ROLE_CONSUMER",
  "userId": 123,
  "fullName": "Alice Consumer"
}
```

### Login
`POST /api/auth/login`

Request body:
```json
{
  "email": "alice@example.com",
  "password": "StrongPassword123"
}
```

Response body is the same shape as register.

### Current user
`GET /api/auth/me`

Headers:
- `Authorization: Bearer <token>`

Response body:
```json
{
  "id": 123,
  "fullName": "Alice Consumer",
  "email": "alice@example.com",
  "role": "ROLE_CONSUMER"
}
```

## API Endpoints

### Public marketplace endpoints
These endpoints require only authentication, not a specific role, because global security requires authenticated requests for all non-auth paths.

| Method | Path | Description |
|---|---|---|
| GET | `/api/marketplace/apis` | Browse marketplace APIs with paging and filters |
| GET | `/api/marketplace/apis/{id}` | Get detail for a single API |
| GET | `/api/marketplace/apis/{apiId}/plans` | List subscription plans for an API |

Query parameters for `/api/marketplace/apis`:
- `page` (default `0`)
- `size` (default `12`)
- `search`
- `category`
- `pricing`
- `sort` (default `NEWEST`)

### Consumer endpoints
Requires `ROLE_CONSUMER`.

| Method | Path | Description |
|---|---|---|
| GET | `/api/consumer/profile` | Get current consumer profile |
| PUT | `/api/consumer/profile` | Update consumer profile |
| GET | `/api/consumer/marketplace/apis` | Browse available APIs |
| GET | `/api/consumer/marketplace/apis/{id}` | Get marketplace API details |
| GET | `/api/consumer/marketplace/apis/{apiId}/plans` | Get API subscription plans |
| POST | `/api/consumer/subscriptions` | Create subscription request |
| POST | `/api/consumer/dev/subscriptions/{subscriptionId}/activate` | Activate a pending subscription (dev/testing path) |
| GET | `/api/consumer/api-keys` | List consumer API keys |
| POST | `/api/consumer/subscriptions/{subscriptionId}/api-key/regenerate` | Regenerate API key |
| DELETE | `/api/consumer/api-keys/{id}` | Revoke API key |
| GET | `/api/consumer/subscriptions` | List consumer subscriptions |
| GET | `/api/consumer/subscriptions/{id}` | Get subscription details |
| PATCH | `/api/consumer/subscriptions/{id}/cancel` | Cancel subscription |
| GET | `/api/consumer/subscriptions/{subscriptionId}/documentation` | Retrieve documentation for an active subscription |
| GET | `/api/consumer/usage` | Get usage summary |
| GET | `/api/consumer/dashboard` | Get consumer dashboard summary |

#### Consumer request payloads

`PUT /api/consumer/profile`
```json
{
  "displayName": "Alice Example",
  "companyName": "Alice Corp",
  "website": "https://alice.example.com",
  "country": "USA",
  "profileImage": "https://example.com/avatar.png"
}
```

`POST /api/consumer/subscriptions`
```json
{
  "apiId": 1,
  "planId": 10
}
```

### Provider endpoints
Requires `ROLE_PROVIDER`.

| Method | Path | Description |
|---|---|---|
| GET | `/api/provider/profile` | Get provider profile |
| PUT | `/api/provider/profile` | Update provider profile |
| GET | `/api/provider/dashboard` | Get provider dashboard |
| GET | `/api/provider/apis` | List provider APIs |
| GET | `/api/provider/apis/{id}` | Get provider API details |
| POST | `/api/provider/apis` | Create a new API |
| PUT | `/api/provider/apis/{id}` | Update API details |
| DELETE | `/api/provider/apis/{id}` | Delete API |
| PATCH | `/api/provider/apis/{id}/submit` | Submit API for approval |
| PATCH | `/api/provider/apis/{id}/archive` | Archive API |
| POST | `/api/provider/apis/{id}/plans` | Create subscription plan |
| PUT | `/api/provider/plans/{id}` | Update subscription plan |
| DELETE | `/api/provider/plans/{id}` | Delete plan |
| GET | `/api/provider/apis/{id}/plans` | List API plans |
| POST | `/api/provider/apis/{id}/documentation` | Create API documentation |
| PUT | `/api/provider/apis/{id}/documentation` | Update API documentation |
| GET | `/api/provider/apis/{id}/documentation` | Get API documentation |
| GET | `/api/provider/categories` | List available categories |
| POST | `/api/provider/upload` | Upload provider logo/image |

#### Provider request payloads

`POST /api/provider/apis`
```json
{
  "name": "Example API",
  "description": "API description",
  "baseUrl": "https://api.example.com/v1",
  "categoryId": 1,
  "logo": "https://example.com/logo.png",
  "version": "1.0.0",
  "authenticationType": "Bearer",
  "rateLimit": 1000,
  "plans": [
    {
      "planName": "Free",
      "price": 0,
      "billingCycle": "FREE",
      "requestLimit": 1000,
      "active": true
    }
  ],
  "documentation": {
    "authenticationGuide": "Use Bearer token",
    "baseEndpoint": "https://api.example.com/v1",
    "headers": "Authorization: Bearer <token>",
    "requestExample": "{ \"example\": \"payload\" }",
    "responseExample": "{ \"result\": \"ok\" }",
    "errorCodes": "400: Bad Request, 401: Unauthorized",
    "markdown": "# API Docs"
  }
}
```

`POST /api/provider/upload` uses `multipart/form-data` with field `file`.

### Admin endpoint
Requires `ROLE_ADMIN`.

| Method | Path | Description |
|---|---|---|
| GET | `/api/admin/dashboard` | Admin dashboard health check |

Response body:
```json
{
  "message": "Admin Dashboard"
}
```

## Response and error handling
The backend uses a global exception handler and returns consistent error payloads for known failures.

### Common error shape
```json
{
  "timestamp": "2026-08-05T12:00:00",
  "status": 404,
  "error": "Not Found",
  "message": "Resource not found",
  "path": "/api/consumer/subscriptions/999"
}
```

### Validation errors
Validation failures return HTTP `400 Bad Request` with field-level details.

### Authentication errors
- Invalid credentials: `401 Unauthorized`
- Missing or invalid token: `401 Unauthorized`
- Forbidden role access: `403 Forbidden`

## Recommended API Test Flows

### 1. Authentication smoke test
- Register a consumer and a provider.
- Login using both accounts.
- Confirm `Authorization: Bearer <token>` works for protected endpoints.

### 2. Consumer marketplace and subscription flow
1. Login as consumer.
2. `GET /api/consumer/marketplace/apis` to browse available APIs.
3. `GET /api/consumer/marketplace/apis/{id}/plans` for a chosen API.
4. `POST /api/consumer/subscriptions` to create a subscription.
5. `POST /api/consumer/dev/subscriptions/{subscriptionId}/activate` to activate it.
6. `GET /api/consumer/subscriptions/{id}` to verify active status.
7. `GET /api/consumer/subscriptions/{subscriptionId}/documentation` to retrieve API docs.
8. `POST /api/consumer/subscriptions/{subscriptionId}/api-key/regenerate` to generate an API key.
9. `DELETE /api/consumer/api-keys/{id}` to revoke the API key.
10. `PATCH /api/consumer/subscriptions/{id}/cancel` to cancel the subscription.
11. `GET /api/consumer/usage?subscriptionId={id}` for usage summary.

### 3. Provider API lifecycle
1. Login as provider.
2. `POST /api/provider/apis` to create a new API.
3. `GET /api/provider/apis` to confirm it appears.
4. `PUT /api/provider/apis/{id}` to update API details.
5. `POST /api/provider/apis/{id}/plans` to add a plan.
6. `GET /api/provider/apis/{id}/plans` to verify plans.
7. `POST /api/provider/apis/{id}/documentation` to add docs.
8. `GET /api/provider/apis/{id}/documentation` to verify docs.
9. `PATCH /api/provider/apis/{id}/submit` to submit the API.
10. `PATCH /api/provider/apis/{id}/archive` to archive it.
11. `DELETE /api/provider/apis/{id}` to remove it.

### 4. Admin check
- Login with seeded admin account and call `GET /api/admin/dashboard`.

## Notes and testing caveats
- The backend currently seeds default categories and roles on startup.
- The public marketplace controller is not explicitly role-guarded, but it still requires authentication because of the global `anyRequest().authenticated()` rule.
- Consumer subscription activation is only available via `/api/consumer/dev/subscriptions/{subscriptionId}/activate`.
- The app uses H2 database by default, so data is not persisted between restarts.
- The provider upload endpoint accepts file upload but the actual storage destination is handled by the provider service implementation.

## Useful URLs
- Swagger UI: `http://localhost:8081/swagger-ui.html`
- OpenAPI JSON: `http://localhost:8081/v3/api-docs`
- Default H2 console (if enabled by configuration and runtime profile): provided by Spring Boot H2 support

## Verification commands
```powershell
./mvnw.cmd clean package
./mvnw.cmd test
./mvnw.cmd spring-boot:run
```

Use the `Authorization` header for protected requests:
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
