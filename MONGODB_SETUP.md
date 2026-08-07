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
- Place secrets in a local environment file or shell session.
- Do not commit credentials to the repository.
- The repository already contains a local MongoDB env file and ignores it from version control.

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
- If Atlas rejects the connection, validate the IP allowlist and database user credentials.
- If the app starts but data is missing, ensure the initial admin seeding logic runs successfully.
