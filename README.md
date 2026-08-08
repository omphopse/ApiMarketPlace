# API Marketplace MVP

## Backend

Run the Spring Boot application:

```bash
./mvnw.cmd spring-boot:run
```

The API will be available at http://localhost:8081.

Swagger UI is available at http://localhost:8081/swagger-ui.html.

## Consumer API

The consumer module exposes the following endpoints for authenticated users with the `CONSUMER` role:

- `GET /api/consumer/profile` - retrieve the current consumer profile
- `PUT /api/consumer/profile` - update consumer profile details
- `GET /api/consumer/marketplace/apis` - browse available APIs with search, category, pricing, and sort filters
- `GET /api/consumer/marketplace/apis/{id}` - view details for a single marketplace API
- `GET /api/consumer/marketplace/apis/{apiId}/plans` - list subscription plans for a marketplace API
- `POST /api/consumer/subscriptions` - create a new API subscription
- `POST /api/consumer/dev/subscriptions/{subscriptionId}/activate` - activate a created subscription (development/testing path)
- `GET /api/consumer/api-keys` - list active API keys for the consumer
- `POST /api/consumer/subscriptions/{subscriptionId}/api-key/regenerate` - regenerate an API key for a subscription
- `DELETE /api/consumer/api-keys/{id}` - revoke a consumer API key
- `GET /api/consumer/subscriptions` - list the consumer's subscriptions with optional status/search filters
- `GET /api/consumer/subscriptions/{id}` - view a single subscription's details
- `PATCH /api/consumer/subscriptions/{id}/cancel` - cancel an active subscription
- `GET /api/consumer/subscriptions/{subscriptionId}/documentation` - retrieve API documentation for an active subscription
- `GET /api/consumer/usage` - view usage summary for the consumer or a subscription
- `GET /api/consumer/dashboard` - retrieve the consumer dashboard summary

Use Swagger UI to explore request/response models and authentication details.

## Database

Start MySQL with Docker Compose:

```bash
docker compose up -d mysql
```

## Frontend

Install dependencies and run the Vite app:

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at http://localhost:3000.

## Email notifications

The backend uses Gmail SMTP through Spring Mail. Copy `.env.example` to your local environment and set `MAIL_USERNAME`, `MAIL_PASSWORD` (a Gmail App Password), and `MAIL_ENABLED=true`. Never commit either credential. See [EMAIL_NOTIFICATION_GUIDE.md](EMAIL_NOTIFICATION_GUIDE.md) for supported events and testing.

MongoDB Atlas and JWT settings are also environment-backed; see `MONGODB_SETUP.md`.
