# API Marketplace MVP

## Backend

Run the Spring Boot application:

```bash
./mvnw.cmd spring-boot:run
```

The API will be available at http://localhost:8080.

Swagger UI is available at http://localhost:8080/swagger-ui.html.

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
