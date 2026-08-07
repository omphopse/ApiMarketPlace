# MongoDB Migration Report

## Summary
The backend persistence layer has been migrated from Spring Data JPA/Hibernate/MySQL to Spring Data MongoDB with Atlas-compatible configuration.

## Entities Migrated
- User
- Role
- ProviderProfile
- ConsumerProfile
- Api
- Category
- SubscriptionPlan
- Subscription
- ApiKey
- ApiDocumentation
- UsageLog
- AuditLog

## Repositories Migrated
- UserRepository
- RoleRepository
- ProviderProfileRepository
- ConsumerProfileRepository
- ApiRepository
- CategoryRepository
- SubscriptionPlanRepository
- SubscriptionRepository
- ApiKeyRepository
- ApiDocumentationRepository
- UsageLogRepository
- AuditLogRepository

## Collections Created
The application now targets MongoDB collections matching the above domain entities.

## Indexes Added
- Email uniqueness is preserved via indexed fields.
- Common query paths are indexed for users, API discovery, subscriptions, and API keys.

## Breaking Changes
- Hibernate-specific generation and relational annotations were removed.
- JPQL-based repository methods were replaced with Mongo-friendly query methods.

## API Compatibility
- Controllers, DTOs, endpoint paths, JWT auth, and role-based permissions remain unchanged.

## Known Limitations
- MongoDB ID generation is handled through a lightweight sequence mechanism so legacy Long identifiers remain stable.
- Full Atlas runtime verification depends on the availability of the configured Atlas environment variables.
