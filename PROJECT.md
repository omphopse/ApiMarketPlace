# API Marketplace Project Documentation

## 1. Project Vision

The API Marketplace is a multi-tenant platform for buying, selling, and consuming APIs. Providers publish APIs with documentation and pricing, consumers discover them, subscribe, and integrate them into their products. Admins oversee the platform, manage users, and ensure compliance and quality.

Providers are organizations or developers who expose APIs, define subscription tiers, and manage documentation. Consumers are application teams or developers who search for APIs, subscribe to plans, and use API keys. Admins maintain the marketplace, review accounts, and manage platform-level operations.

The business model is subscription-based. Providers earn recurring revenue through monthly or annual subscriptions, while consumers gain reliable access to useful APIs without building everything from scratch.

## 2. User Roles

### ROLE_ADMIN
- Oversees platform operations
- Manages users, roles, and platform settings
- Reviews provider onboarding and system health
- Maintains analytics, reports, and support workflows

### ROLE_PROVIDER
- Publishes APIs and versioned documentation
- Creates subscription plans and API keys
- Monitors usage and revenue
- Manages provider profile and catalog items

### ROLE_CONSUMER
- Discovers APIs and evaluates offerings
- Subscribes to plans and consumes APIs
- Reviews vendor experiences and manages subscriptions
- Uses dashboard insights for usage and billing

## 3. Complete Feature List

### Landing Website
- Public marketing site with authentication entry points
- Role-based onboarding flow

### Authentication
- Registration with role selection
- Login with JWT issuance
- Protected routes and role-based access control
- Password hashing with BCrypt

### Provider Module
- Provider profile management
- API catalog and documentation management
- API keys and plan publishing
- Usage analytics and billing summaries

### Consumer Module
- Search and browse APIs
- View plans and pricing
- Subscribe and manage API access
- Reviews and feedback

### Admin Module
- User and role management
- Platform analytics and reports
- Revenue oversight and moderation

### Future Modules
- Payments and invoices
- Usage logs and audit trails
- Reviews and ratings
- Categories and search filters
- Billing integration and webhook support

### Email Notifications
Spring Mail with Gmail SMTP is configured through `MAIL_USERNAME`, `MAIL_PASSWORD`, and `MAIL_ENABLED`. Notification templates are stored under `src/main/resources/templates/email/`. MongoDB Atlas and JWT values must be provided through environment variables; credentials are never stored in source.

## 4. Module Breakdown

### Authentication Module
- Owns tables: users, roles
- Exposes: POST /api/auth/register, POST /api/auth/login, GET /api/auth/me
- Frontend pages: Landing, Login, Register
- Dependencies: none

### Provider Module
- Owns tables: provider_profiles, apis, api_versions, subscription_plans, api_keys
- Exposes: provider dashboard and provider management APIs
- Frontend pages: Provider Dashboard, API management pages
- Dependencies: authentication, categories, payments

### Consumer Module
- Owns tables: consumer_profiles, subscriptions, reviews
- Exposes: consumer dashboard and subscription APIs
- Frontend pages: Consumer Dashboard, Browse APIs, Subscription pages
- Dependencies: authentication, provider module

### Admin Module
- Owns tables: admin_logs, notifications
- Exposes: admin dashboard and moderation APIs
- Frontend pages: Admin Dashboard, reports, moderation pages
- Dependencies: all modules

## 5. Complete Database Design

### roles
- Stores role definitions for ADMIN, PROVIDER, and CONSUMER.

### users
- Stores account information and authentication state.

### provider_profiles
- Stores provider organization or developer metadata.

### consumer_profiles
- Stores consumer-specific details and preferences.

### apis
- Stores API catalog entries.

### api_versions
- Stores versioned API definitions and docs.

### subscription_plans
- Stores pricing tiers and usage limits.

### subscriptions
- Stores consumer subscriptions to plans.

### payments
- Stores payment transactions and invoices.

### api_keys
- Stores consumer or provider API keys.

### usage_logs
- Stores API usage events.

### categories
- Stores API categories and tags.

### reviews
- Stores provider or API ratings and comments.

### notifications
- Stores real-time alerts and platform messages.

### admin_logs
- Stores administrative action history.

## 6. Frontend Pages

- Landing: public entry page
- Login: authenticate existing users
- Register: create provider or consumer accounts
- Admin Dashboard: admin workspace
- Provider Dashboard: provider workspace
- Consumer Dashboard: consumer workspace
- 404: fallback not-found page

## 7. REST API Roadmap

### Authentication
- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me

### Provider
- GET /api/provider/dashboard
- POST /api/provider/apis
- GET /api/provider/apis

### Consumer
- GET /api/consumer/profile
- PUT /api/consumer/profile
- GET /api/consumer/marketplace/apis
- GET /api/consumer/marketplace/apis/{id}
- GET /api/consumer/marketplace/apis/{apiId}/plans
- POST /api/consumer/subscriptions
- POST /api/consumer/dev/subscriptions/{subscriptionId}/activate
- GET /api/consumer/api-keys
- POST /api/consumer/subscriptions/{subscriptionId}/api-key/regenerate
- DELETE /api/consumer/api-keys/{id}
- GET /api/consumer/subscriptions
- GET /api/consumer/subscriptions/{id}
- PATCH /api/consumer/subscriptions/{id}/cancel
- GET /api/consumer/subscriptions/{subscriptionId}/documentation
- GET /api/consumer/usage
- GET /api/consumer/dashboard

### Admin
- GET /api/admin/dashboard
- GET /api/admin/users
- POST /api/admin/users/approve

### Payments
- POST /api/payments/checkout
- GET /api/payments/{id}

### Analytics
- GET /api/analytics/usage
- GET /api/analytics/revenue

### Subscriptions
- GET /api/subscriptions
- PUT /api/subscriptions/{id}

### API Keys
- POST /api/api-keys
- DELETE /api/api-keys/{id}

## 8. Team Development Plan

### Developer 1 - Authentication & Security
- Implement JWT, security filters, role authorization, and default admin initialization.

### Developer 2 - Provider Module
- Build provider profiles, API management, plans, docs, and API keys.

### Developer 3 - Consumer Module
- Build discovery, subscriptions, reviews, and consumer experience.

### Developer 4 - Admin + Payments
- Build admin dashboard, moderation, analytics, and payment integration.

Integration points include shared DTOs, shared auth middleware, common exception handling, and predictable API contracts.

## 9. Folder Structure

### Backend
- config: security and OpenAPI config
- controller: REST endpoints
- dto: request and response contracts
- entity: persistence models
- repository: data access
- service: business logic interfaces
- service.impl: implementations
- security: auth utilities and entry points
- filter: JWT filters
- exception: centralized error handling
- startup: boot-time initialization

### Frontend
- components: reusable React components
- pages: route-level views
- layouts: shared page containers
- services: API client wrappers
- hooks: custom hooks
- contexts: global state
- routes: route configuration
- utils: helper functions

## 10. Development Standards

- Use DTOs for all external API contracts.
- Keep controllers thin and delegate to services.
- Use validation annotations on request objects.
- Use centralized exception handling.
- Follow lowercase package naming and camelCase Java identifiers.
- Use feature branches such as feature/authentication, feature/provider-module.
- Use commit messages like feat(auth): add JWT login flow.
- Review checklist includes validation, security, tests, documentation, and role checks.
