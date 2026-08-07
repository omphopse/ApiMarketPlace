# Database Migration Plan: JPA/MySQL to MongoDB Atlas

## Current Architecture
- Backend is a Spring Boot 3.3 application with REST controllers, DTOs, services, and repositories.
- Persistence is currently built around Spring Data JPA with Hibernate and a MySQL/H2-style relational model.
- The API contract is driven by controllers and DTOs; the persistence layer is largely an implementation detail.
- Core domain objects include users, roles, provider profiles, consumer profiles, APIs, categories, plans, subscriptions, API keys, audit logs, and usage logs.

## Target Architecture
- Replace Spring Data JPA/Hibernate with Spring Data MongoDB.
- Store the same domain data in MongoDB collections while keeping controller routes, DTOs, JWT auth, and role-based authorization intact.
- Read Atlas connection details from environment variables and keep credentials out of source control.

## Migration Strategy
1. Inventory the existing entities, repositories, and JPA-specific annotations.
2. Convert entities to MongoDB documents while preserving the existing Java API surface.
3. Replace repository interfaces with Spring Data Mongo repositories and adapt custom queries.
4. Keep services and controllers largely unchanged so the REST contract remains stable.
5. Configure the application to use Atlas connection settings from environment variables.
6. Validate startup, authentication, CRUD flows, and admin/provider/consumer workflows.

## Breaking Changes
- JPA-generated numeric identity handling is replaced by Mongo document ID handling.
- Custom JPQL queries must be rewritten as Mongo query methods or annotated queries.
- Relational joins become document references or embedded values depending on access patterns.
- Hibernate-specific timestamp annotations are replaced with Spring Data auditing annotations.

## Entity Mapping
- User -> users collection
- Role -> roles collection
- ProviderProfile -> provider_profiles collection
- ConsumerProfile -> consumer_profiles collection
- Api -> apis collection
- Category -> categories collection
- SubscriptionPlan -> subscription_plans collection
- Subscription -> subscriptions collection
- ApiKey -> api_keys collection
- ApiDocumentation -> api_documentation collection
- UsageLog -> usage_logs collection
- AuditLog -> audit_logs collection

## Collection Mapping
| Domain object | Collection |
|---|---|
| User | users |
| Role | roles |
| ProviderProfile | provider_profiles |
| ConsumerProfile | consumer_profiles |
| Api | apis |
| Category | categories |
| SubscriptionPlan | subscription_plans |
| Subscription | subscriptions |
| ApiKey | api_keys |
| ApiDocumentation | api_documentation |
| UsageLog | usage_logs |
| AuditLog | audit_logs |

## Repository Migration
- JpaRepository -> MongoRepository
- JpaSpecificationExecutor usage is replaced by explicit query construction or repository methods.
- Custom queries previously expressed in JPQL are rewritten to Mongo query methods.

## Authentication Impact
- Authentication and JWT flow remain compatible.
- User lookup continues through the user repository and the same security filter chain.
- Password hashing and role checks do not change.

## Testing Strategy
- Build the project after switching dependencies and entity mappings.
- Verify application startup and repository interactions.
- Exercise auth/register/login, provider CRUD, consumer subscriptions, admin moderation, and category management.

## Rollback Strategy
- Keep the JPA-based code in the repository history for reference.
- If Atlas connectivity or runtime issues appear, revert the persistence layer changes and restore the earlier configuration while keeping API code intact.
