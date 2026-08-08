# MongoDB Atlas Setup

## Environment Variables
The application reads its MongoDB connection settings from environment variables.

Required variables:
- MONGODB_URI
- MONGODB_DATABASE

Example:
```powershell
$env:MONGODB_URI="mongodb+srv://<username>:<password>@cluster0.example.mongodb.net"
$env:MONGODB_DATABASE="api_marketplace"
```

## Local Development
- Place secrets in a local properties file or shell session.
- Do not commit credentials to the repository.
- The project supports a root-level `mongodb.properties` file with Atlas settings.
- `mongodb.properties` is ignored from version control and is loaded automatically if present.

## Running the Backend
```powershell
./mvnw.cmd spring-boot:run
```

## Collections
The app creates and uses these collections automatically:
- users
- roles
- provider_profiles
- consumer_profiles
- apis
- categories
- subscription_plans
- subscriptions
- api_keys
- api_documentation
- usage_logs
- audit_logs

## Indexes
Recommended indexes include:
- users.email
- users.fullName
- apis.providerId
- apis.categoryId
- apis.status
- subscriptions.consumerId
- subscriptions.apiId
- api_keys.keyHash

## Troubleshooting
- If startup fails, verify that the MONGODB_URI and MONGODB_DATABASE environment variables are set.

## Email configuration

Email delivery is independent of MongoDB business operations. Configure `MAIL_USERNAME`, `MAIL_PASSWORD`, and `MAIL_ENABLED` as environment variables; never put credentials in this file or in committed properties files.
- If Atlas rejects the connection, validate the IP allowlist and database user credentials.
- If the app starts but data is missing, ensure the initial admin seeding logic runs successfully.
