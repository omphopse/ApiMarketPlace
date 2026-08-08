# API Marketplace Backend Testing Guide

## Overview
This guide reflects the current merged state of the project after the master/admin merge. The backend now includes the original marketplace, consumer, provider, and authentication flows plus the new admin/Phase 4 features such as user moderation, provider approvals, analytics, audit logs, and category management.

The backend is implemented in the Spring Boot application under src/main/java and uses Spring Boot 3.3, Spring Security, JWT authentication, JPA, Lombok, SpringDoc OpenAPI, and an H2 in-memory database for local development.

## Current Project Status
- The repository is currently on the merged master branch with the admin/Phase 4 work integrated.
- The merged project was verified locally with the Maven test suite.
- Default seeded values are available for roles, categories, and the default admin account.

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
- Base URL: http://localhost:8081
- Swagger UI: http://localhost:8081/swagger-ui.html
- OpenAPI JSON: http://localhost:8081/v3/api-docs
- H2 console: http://localhost:8081/h2-console

If port 8081 is already in use, override with:
```powershell
java -jar target\ApiMarketplace-0.0.1-SNAPSHOT.jar --server.port=8082
```

### Tests
```powershell
./mvnw.cmd test
```

## Runtime Configuration
The backend uses the H2 in-memory database by default, as configured in src/main/resources/application.properties:
- spring.datasource.url=jdbc:h2:mem:api_marketplace
- spring.jpa.hibernate.ddl-auto=create-drop
- spring.h2.console.enabled=true

JWT settings:
- `JWT_SECRET` must be supplied through the environment; do not document or commit its value.
- jwt.expiration-ms=86400000

## Authentication & Authorization

### Public endpoints
These endpoints are intentionally open:
- POST /api/auth/register
- POST /api/auth/login
- GET /swagger-ui.html
- GET /v3/api-docs/**
- GET /swagger-ui/**

### JWT protection
All other endpoints require a bearer token in the Authorization header.

### Role enforcement
- /api/consumer/** requires ROLE_CONSUMER
- /api/provider/** requires ROLE_PROVIDER
- /api/admin/** requires ROLE_ADMIN
- /api/marketplace/** is authenticated but not explicitly role-guarded by the controller layer

### Default admin account
The application seeds roles and categories at startup and creates one default admin if missing:
- Email: admin@marketplace.com
- Password: Admin@123

## Authentication Flow

### Register
POST /api/auth/register

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

Note: when a provider registers with `role = "PROVIDER"`, the application now creates an empty provider profile record automatically. Providers can then immediately call `/api/provider/profile` or update their profile without sending `id` or `userId`.

### Login
POST /api/auth/login

Request body:
```json
{
  "email": "alice@example.com",
  "password": "StrongPassword123"
}
```

Response body is the same shape as register.

### Current user
GET /api/auth/me

Headers:
- Authorization: Bearer <token>

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
These endpoints are available to authenticated users and support browsing the marketplace.

| Method | Path | Description |
|---|---|---|
| GET | /api/marketplace/apis | Browse marketplace APIs with paging and filters |
| GET | /api/marketplace/apis/{id} | Get the details of a marketplace API |
| GET | /api/marketplace/apis/{apiId}/plans | List subscription plans for an API |

Query parameters for /api/marketplace/apis:
- page (default 0)
- size (default 12)
- search
- category
- pricing
- sort (default NEWEST)

### Consumer endpoints
Requires ROLE_CONSUMER.

| Method | Path | Description |
|---|---|---|
| GET | /api/consumer/profile | Get current consumer profile |
| PUT | /api/consumer/profile | Update consumer profile |
| GET | /api/consumer/marketplace/apis | Browse available APIs |
| GET | /api/consumer/marketplace/apis/{id} | Get marketplace API details |
| GET | /api/consumer/marketplace/apis/{apiId}/plans | List subscription plans |
| POST | /api/consumer/subscriptions | Create a subscription request |
| POST | /api/consumer/dev/subscriptions/{subscriptionId}/activate | Activate a pending subscription (dev/testing path) |
| GET | /api/consumer/api-keys | List consumer API keys |
| POST | /api/consumer/subscriptions/{subscriptionId}/api-key/regenerate | Regenerate an API key |
| DELETE | /api/consumer/api-keys/{id} | Revoke an API key |
| GET | /api/consumer/subscriptions | List consumer subscriptions |
| GET | /api/consumer/subscriptions/{id} | Get subscription details |
| PATCH | /api/consumer/subscriptions/{id}/cancel | Cancel a subscription |
| GET | /api/consumer/subscriptions/{subscriptionId}/documentation | Retrieve API docs for an active subscription |
| GET | /api/consumer/usage | Get usage summary |
| GET | /api/consumer/dashboard | Get consumer dashboard summary |

#### Consumer request payloads

PUT /api/consumer/profile
```json
{
  "displayName": "Alice Example",
  "companyName": "Alice Corp",
  "website": "https://alice.example.com",
  "country": "USA",
  "profileImage": "https://example.com/avatar.png"
}
```

POST /api/consumer/subscriptions
```json
{
  "apiId": 1,
  "planId": 10
}
```

### Provider endpoints
Requires ROLE_PROVIDER.

| Method | Path | Description |
|---|---|---|
| GET | /api/provider/profile | Get provider profile |
| PUT | /api/provider/profile | Update provider profile |
| GET | /api/provider/dashboard | Get provider dashboard |
| GET | /api/provider/apis | List provider APIs |
| GET | /api/provider/apis/{id} | Get provider API details |
| POST | /api/provider/apis | Create a new API |
| PUT | /api/provider/apis/{id} | Update API details |
| DELETE | /api/provider/apis/{id} | Delete API |
| PATCH | /api/provider/apis/{id}/submit | Submit an API for approval |
| PATCH | /api/provider/apis/{id}/archive | Archive an API |
| POST | /api/provider/apis/{id}/plans | Create a subscription plan |
| PUT | /api/provider/plans/{id} | Update a subscription plan |
| DELETE | /api/provider/plans/{id} | Delete a subscription plan |
| GET | /api/provider/apis/{id}/plans | List API plans |
| POST | /api/provider/apis/{id}/documentation | Create API documentation |
| PUT | /api/provider/apis/{id}/documentation | Update API documentation |
| GET | /api/provider/apis/{id}/documentation | Get API documentation |
| GET | /api/provider/categories | List available categories |
| POST | /api/provider/upload | Upload a provider logo/image |

#### Provider request payloads

PUT /api/provider/profile
```json
{
  "companyName": "Example Provider",
  "website": "https://provider.example.com",
  "description": "Provider description",
  "supportEmail": "support@provider.example.com",
  "contactNumber": "+1-555-0100",
  "country": "USA",
  "logo": "https://example.com/logo.png"
}
```

Note: `id` and `userId` are managed by the server and should not be included in this request.

POST /api/provider/apis
```json
{
  "name":"Example API",
  "description":"API description",
  "baseUrl":"https://api.example.com/v1",
  "categoryId":"6a775ec51025ce4315d9a7b0",
  "logo":"https://example.com/logo.png",
  "version":"1.0.0",
  "authenticationType":"Bearer",
  "rateLimit":1000,
  "plans":[
    {"planName":"Free","price":0,"billingCycle":"FREE","requestLimit":1000,"active":true}
  ],
  "documentation":{
    "authenticationGuide":"Use Bearer token",
    "baseEndpoint":"https://api.example.com/v1",
    "headers":"Authorization: Bearer <token>",
    "requestExample":"{ \"example\": \"payload\" }",
    "responseExample":"{ \"result\": \"ok\" }",
    "errorCodes":"400: Bad Request, 401: Unauthorized",
    "markdown":"# API Docs"
  }
}
```

POST /api/provider/upload uses multipart/form-data with field file.

### Admin endpoints
Requires ROLE_ADMIN.

| Method | Path | Description |
|---|---|---|
| GET | /api/admin/dashboard | Admin dashboard entry point |
| GET | /api/admin/users | List all users |
| GET | /api/admin/users/{id} | Get a specific user |
| PUT | /api/admin/users/{id}/status | Enable or disable a user |
| GET | /api/admin/users/search | Search users by keyword |
| DELETE | /api/admin/users/{id} | Delete a user |
| GET | /api/admin/providers/pending | List pending providers |
| PUT | /api/admin/providers/{id}/approve | Approve a provider |
| PUT | /api/admin/providers/{id}/reject | Reject a provider |
| GET | /api/admin/analytics | Get admin analytics |
| GET | /api/admin/audit-logs | List audit logs |
| GET | /api/admin/audit-logs/{id} | Get one audit log |
| GET | /api/admin/categories | List categories |
| POST | /api/admin/categories | Create a category |
| GET | /api/admin/categories/{id} | Get one category |
| PUT | /api/admin/categories/{id} | Update a category |
| DELETE | /api/admin/categories/{id} | Delete a category |

## Response and Error Handling
The backend uses a global exception handler and returns consistent error payloads for known failures.

### Common error shape
```json
{
  "timestamp": "2026-08-06T12:00:00",
  "status": 404,
  "error": "Not Found",
  "message": "Resource not found",
  "path": "/api/consumer/subscriptions/999"
}
```

### Validation errors
Validation failures return HTTP 400 Bad Request with field-level details.

### Authentication errors
- Invalid credentials: 401 Unauthorized
- Missing or invalid token: 401 Unauthorized
- Forbidden role access: 403 Forbidden

## Recommended API Test Flows

### 1. Authentication smoke test
- Register a consumer and a provider.
- Login with both accounts.
- Confirm that Authorization: Bearer <token> works for protected endpoints.

### 2. Consumer marketplace and subscription flow
1. Login as a consumer.
2. GET /api/consumer/marketplace/apis to browse APIs.
3. GET /api/consumer/marketplace/apis/{id}/plans for a chosen API.
4. POST /api/consumer/subscriptions to create a subscription.
5. POST /api/consumer/dev/subscriptions/{subscriptionId}/activate to activate it.
6. GET /api/consumer/subscriptions/{id} to verify the active state.
7. GET /api/consumer/subscriptions/{subscriptionId}/documentation to retrieve API docs.
8. POST /api/consumer/subscriptions/{subscriptionId}/api-key/regenerate to generate an API key.
9. DELETE /api/consumer/api-keys/{id} to revoke the API key.
10. PATCH /api/consumer/subscriptions/{id}/cancel to cancel the subscription.
11. GET /api/consumer/usage?subscriptionId={id} for the usage summary.

### 3. Provider API lifecycle
1. Login as a provider.
2. POST /api/provider/apis to create a new API.
3. GET /api/provider/apis to confirm it appears.
4. PUT /api/provider/apis/{id} to update API details.
5. POST /api/provider/apis/{id}/plans to add a plan.
6. GET /api/provider/apis/{id}/plans to verify plans.
7. POST /api/provider/apis/{id}/documentation to add docs.
8. GET /api/provider/apis/{id}/documentation to verify docs.
9. PATCH /api/provider/apis/{id}/submit to submit the API.
10. PATCH /api/provider/apis/{id}/archive to archive it.
11. DELETE /api/provider/apis/{id} to remove it.

### 4. Admin workflow
1. Login with the seeded admin account.
2. Call GET /api/admin/dashboard to confirm access.
3. Review users via GET /api/admin/users and search via GET /api/admin/users/search.
4. Review pending providers via GET /api/admin/providers/pending and approve or reject them.
5. Verify category CRUD via /api/admin/categories.
6. Review audit activity via /api/admin/audit-logs.

## Notes and Testing Caveats
- The backend seeds default roles, categories, and a default admin user on startup.
- The /api/marketplace endpoints are authenticated but are not explicitly role-guarded in the controller layer.
- Consumer subscription activation is only available through /api/consumer/dev/subscriptions/{subscriptionId}/activate.
- The app uses H2 by default, so data is not persisted between restarts.
- The provider upload endpoint accepts file upload but the actual storage destination is handled by the provider service implementation.
- The current merged build was verified with ./mvnw.cmd test.

## Useful URLs
- Swagger UI: http://localhost:8081/swagger-ui.html
- OpenAPI JSON: http://localhost:8081/v3/api-docs
- H2 console: http://localhost:8081/h2-console

## Verification Commands
```powershell
./mvnw.cmd clean package
./mvnw.cmd test
./mvnw.cmd spring-boot:run
```

Use the Authorization header for protected requests:
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
