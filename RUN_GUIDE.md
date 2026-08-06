# API Marketplace — Project Running Guide

## Project Name
API Marketplace

## Backend Stack
- Java 21 (required)
- Spring Boot 3.3.3
- Spring Security with JWT
- Spring Data JPA
- SpringDoc OpenAPI
- H2 in-memory database by default
- MySQL Docker service defined in `compose.yaml`

## Database
- Default local backend database: H2 in-memory
- Docker MySQL image: `mysql:8.0`
- MySQL container name: `api-marketplace-mysql`
- MySQL host port: `3306`
- MySQL database: `api_marketplace`
- MySQL username: `apiuser`
- MySQL password: `password`

## Authentication
- JWT Bearer tokens
- Role-based access control
- Default seeded roles: `ROLE_ADMIN`, `ROLE_PROVIDER`, `ROLE_CONSUMER`
- Default seeded admin account: `admin@marketplace.com` / `Admin@123`

## Current Implemented Phases
- Backend Phase 1 and Phase 2 are included in this project

## Last Updated
- 2026-08-06

---

# 1. What This Guide Is For

This document teaches a developer how to run the API Marketplace backend locally from scratch.
It covers:
- prerequisites
- Docker / MySQL setup
- project configuration
- running the Spring Boot backend
- verifying the backend
- using Swagger
- authentication and JWT
- testing a protected endpoint
- stopping and restarting the app

This guide is based on the actual project files in this repository.

---

# 2. Project Architecture

The application is built like this:

Client / Swagger / Postman
↓
Spring Boot Backend
↓
Spring Security + JWT
↓
Service Layer
↓
Spring Data JPA
↓
Database

### What each part does
- Client / Swagger / Postman: send HTTP requests to the backend.
- Spring Boot Backend: runs the Java API code.
- Spring Security + JWT: checks users and protects endpoints.
- Service Layer: contains business logic.
- Spring Data JPA: talks to the database and maps entities.
- Database: stores users, roles, APIs, subscriptions, and more.

---

# 3. Project Folder Structure

Important folders and files:

```
ApiMarketplace/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   ├── com/example/ApiMarketplace/ApiMarketplaceApplication.java
│   │   │   └── com/marketplace/...      # controllers, services, entities, config
│   │   └── resources/
│   │       ├── application.properties
│   │       └── application-dev.properties
│   └── test/
├── compose.yaml
├── pom.xml
├── mvnw
├── mvnw.cmd
├── PROJECT.md
├── README.md
├── API_TESTING_GUIDE.md
└── RUN_GUIDE.md
```

### What matters most
- `src/main/java`: main backend code.
- `src/main/resources/application.properties`: default backend settings.
- `src/main/resources/application-dev.properties`: optional local development profile settings.
- `compose.yaml`: Docker Compose file for MySQL.
- `pom.xml`: Maven build and dependencies.
- `mvnw` / `mvnw.cmd`: Maven wrapper for running Maven without global Maven installed.

---

# 4. Prerequisites

Before running the project, install:

- Git: to clone the repository.
- Java 21 JDK: required by `pom.xml`.
- Docker Desktop: needed for the MySQL container.
- An IDE such as IntelliJ IDEA or VS Code: optional but useful.
- Postman or a similar API client: optional for testing.

### How to check each one
```powershell
git --version
java --version
docker --version
docker compose version
```

The project includes the Maven wrapper, so global Maven is not required.

---

# 5. Java Version

The project requires Java 21.
This is confirmed in `pom.xml`:
```xml
<java.version>21</java.version>
```

### Check Java
```powershell
java --version
```

Expected output should include `21`.
If a different Java version is installed, the project may fail to compile or run.

---

# 6. Docker Desktop

Docker Desktop runs the MySQL container that this repository defines.

Important points:
- Spring Boot currently uses H2 by default.
- The Docker MySQL service is available in `compose.yaml`.
- The backend does not automatically switch to MySQL without additional datasource settings.

### How Docker fits in
Spring Boot
↓
`localhost:3306` (Docker host port)
↓
Docker
↓
MySQL container `api-marketplace-mysql`
↓
Database `api_marketplace`

---

# 7. First-Time Project Setup

Clone the repository:
```powershell
git clone https://github.com/omphopse/ApiMarketPlace.git
cd ApiMarketPlace
```

This only needs to be done once.

---

# 8. Environment Variables

### Required for default local run
- None. The default local run uses settings in `src/main/resources/application.properties`.

### Optional environment variables
If you later want to connect to MySQL instead of H2, these are the environment variables that Spring Boot can use:

| Variable | Purpose | Required | Example |
|----------|---------|----------|---------|
| `SPRING_PROFILES_ACTIVE` | Activate a profile such as `dev` | No | `dev` |
| `SPRING_DATASOURCE_URL` | MySQL JDBC URL | No | `jdbc:mysql://localhost:3306/api_marketplace` |
| `SPRING_DATASOURCE_USERNAME` | MySQL username | No | `apiuser` |
| `SPRING_DATASOURCE_PASSWORD` | MySQL password | No | `password` |

### Actual configured values in code
The default config is in `application.properties`:
- `spring.datasource.url=jdbc:h2:mem:api_marketplace`
- `spring.datasource.username=sa`
- `spring.datasource.password=` (empty)
- `spring.datasource.driver-class-name=org.h2.Driver`
- `spring.jpa.hibernate.ddl-auto=create-drop`
- `springdoc.swagger-ui.path=/swagger-ui.html`

---

# 9. .env File

This project does not include a `.env` file and does not automatically load one.
Do not assume Spring Boot will read `.env` here.
Use the Maven wrapper and `application.properties` for the default local run.

---

# 10. Spring Profiles

The project supports these profiles:
- `default`: used when no profile is active.
- `dev`: defined by `src/main/resources/application-dev.properties`.
- `test`: used during automated tests.

### What each profile does
- `default`: uses H2 in-memory database and `create-drop` schema behavior.
- `dev`: adds `spring.jpa.hibernate.ddl-auto=update`, `spring.jpa.show-sql=true`, and CORS origin `http://localhost:5173`.
- `test`: activated automatically during tests.

### Activate the dev profile
PowerShell:
```powershell
$env:SPRING_PROFILES_ACTIVE="dev"
.\mvnw.cmd spring-boot:run
```
CMD:
```cmd
set SPRING_PROFILES_ACTIVE=dev
mvnw.cmd spring-boot:run
```
Or use Maven system property:
```powershell
.\mvnw.cmd spring-boot:run -Dspring.profiles.active=dev
```

---

# 11. Starting Docker / MySQL

The Docker Compose file is `compose.yaml`.
Start the MySQL service with:
```powershell
docker compose -f compose.yaml up -d mysql
```

- `docker compose up` starts services.
- `-d` runs them in the background.
- `mysql` starts only the MySQL service defined in the file.

---

# 12. Verify Docker

Check that the MySQL container is running:
```powershell
docker compose -f compose.yaml ps
```

You should see a service named `mysql` and container `api-marketplace-mysql`.

---

# 13. Check Docker Logs

If you need to inspect MySQL startup:
```powershell
docker compose -f compose.yaml logs -f mysql
```

Or:
```powershell
docker logs api-marketplace-mysql --tail 50
```

---

# 14. Docker Compose Configuration

From `compose.yaml`:
- Image: `mysql:8.0`
- Container name: `api-marketplace-mysql`
- Host port: `3306`
- Container port: `3308`
- Database: `api_marketplace`
- Username: `apiuser`
- Password: `password`
- Volume: `D:/docker_data/Api:/var/lib/mysql`

This means the MySQL server is available on the host at `localhost:3306`.

---

# 15. Understanding Docker Data Persistence

- `docker compose stop`: stops containers but keeps data.
- `docker compose down`: stops containers and removes networks.
- `docker compose down -v`: stops containers and deletes volumes/data.

⚠️ Warning: `docker compose down -v` deletes the MySQL volume and database data.

---

# 16. Verify MySQL

Verify the MySQL container is accessible:
```powershell
docker exec api-marketplace-mysql mysql -uapiuser -ppassword -e "SHOW DATABASES;"
```

Expected output includes:
- `api_marketplace`
- `information_schema`
- `performance_schema`

> Note: the default backend configuration in this repository uses H2, not MySQL.

---

# 17. Optional Database GUI

If you want a GUI, use DBeaver, MySQL Workbench, or IntelliJ Database tools.
Connection settings:
- Host: `localhost`
- Port: `3306`
- Database: `api_marketplace`
- Username: `apiuser`
- Password: `password`

This GUI is optional and not required to run the backend.

---

# 18. Database Schema Creation

The project does not use Flyway or Liquibase.
It uses JPA schema generation.

Default config in `application.properties`:
- `spring.jpa.hibernate.ddl-auto=create-drop`

That means:
- Tables are created on startup.
- Tables are dropped when the app stops.

In `application-dev.properties`:
- `spring.jpa.hibernate.ddl-auto=update`
- `spring.jpa.show-sql=true`

---

# 19. Seed Data

The backend automatically seeds at startup via `src/main/java/com/marketplace/startup/DefaultAdminInitializer.java`.
It creates:
- roles: `ROLE_ADMIN`, `ROLE_PROVIDER`, `ROLE_CONSUMER`
- categories for the marketplace
- default admin user if not already present

Default admin credentials:
- Email: `admin@marketplace.com`
- Password: `Admin@123`

---

# 20. Running Spring Boot

From the project root on Windows:
```powershell
.\mvnw.cmd spring-boot:run
```

On macOS/Linux:
```bash
./mvnw spring-boot:run
```

This runs the backend using the Maven wrapper.

---

# 21. Running With the Development Profile

To activate the `dev` profile:

PowerShell:
```powershell
$env:SPRING_PROFILES_ACTIVE="dev"
.\mvnw.cmd spring-boot:run
```

Or:
```powershell
.\mvnw.cmd spring-boot:run -Dspring.profiles.active=dev
```

This profile enables SQL logging and CORS origin `http://localhost:5173`.

---

# 22. Running From IntelliJ IDEA

1. Open `ApiMarketPlace` in IntelliJ.
2. Wait for Maven dependencies to finish downloading.
3. Open `src/main/java/com/example/ApiMarketplace/ApiMarketplaceApplication.java`.
4. Run the `main` method.
5. If you need a profile, set `SPRING_PROFILES_ACTIVE=dev` in the run configuration.

---

# 23. Successful Startup

When the app starts successfully, you should see Spring Boot logs like:
- `Tomcat initialized with port 8081 (http)`
- `HikariPool-1 - Start completed.`
- `H2 console available at '/h2-console'`

If port `8081` is already in use, choose another free port with:
```powershell
.\mvnw.cmd spring-boot:run -Dserver.port=8082
```

---

# 24. Application Base URL

Default base URL:
- `http://localhost:8081`

If you override the port, replace `8081` with the chosen port.

---

# 25. Swagger

Swagger UI is available at:
- `http://localhost:8081/swagger-ui.html`

Swagger lets you inspect and execute API endpoints without writing your own client.

---

# 26. First API Test

The first endpoint to test is registration.

Request:
- Method: `POST`
- URL: `http://localhost:8081/api/auth/register`
- Body:
```json
{
  "fullName": "Test Consumer",
  "email": "consumer@example.com",
  "password": "Password123",
  "role": "CONSUMER"
}
```

Expected response includes a JWT token in the `token` field.

---

# 27. Register a Test Provider

Request:
- Method: `POST`
- URL: `http://localhost:8081/api/auth/register`
- Body:
```json
{
  "fullName": "Test Provider",
  "email": "provider@example.com",
  "password": "Password123",
  "role": "PROVIDER"
}
```

---

# 28. Login

Request:
- Method: `POST`
- URL: `http://localhost:8081/api/auth/login`
- Body:
```json
{
  "email": "consumer@example.com",
  "password": "Password123"
}
```

Expected response contains:
- `token`
- `type`: `Bearer`
- `role`
- `userId`
- `fullName`

---

# 29. JWT Authentication

After login, use the token for protected endpoints.

Set the header:
```
Authorization: Bearer <TOKEN>
```

- `Authorization`: HTTP header name
- `Bearer`: authentication scheme
- `<TOKEN>`: JWT returned by `/api/auth/login`

---

# 30. Swagger Authorization

1. Open `http://localhost:8081/swagger-ui.html`.
2. Find the `POST /api/auth/login` endpoint.
3. Execute login and copy the `token` value.
4. Click `Authorize` in Swagger.
5. Paste:
```
Bearer <token>
```
6. Close the dialog.
7. Call a protected endpoint.

---

# 31. Test a Protected Endpoint

After registering and logging in as a consumer:

Request:
- Method: `GET`
- URL: `http://localhost:8081/api/consumer/profile`
- Header: `Authorization: Bearer <TOKEN>`

This verifies authentication and consumer role access.

---

# 32. Recommended Daily Startup Process

1. Start Docker Desktop.
2. Open a terminal in the project root.
3. Run:
   ```powershell
docker compose -f compose.yaml up -d mysql
```
4. Verify container status:
   ```powershell
docker compose -f compose.yaml ps
```
5. Start the backend:
   ```powershell
.\mvnw.cmd spring-boot:run
```
6. Open Swagger: `http://localhost:8081/swagger-ui.html`

---

# 33. Recommended Daily Shutdown Process

1. Stop the Spring Boot backend with `Ctrl + C`.
2. Optionally stop Docker MySQL:
   ```powershell
docker compose -f compose.yaml stop mysql
```
3. If you want to keep data and the service definition, do not use `down -v`.

---

# 34. Starting the Project Again Later

If the container already exists:
```powershell
docker compose -f compose.yaml start mysql
```

If it does not exist or was removed:
```powershell
docker compose -f compose.yaml up -d mysql
```

Then start Spring Boot again:
```powershell
.\mvnw.cmd spring-boot:run
```

---

# 35. Clean Restart

If the app behaves unexpectedly:
1. Stop Spring Boot.
2. Restart MySQL container:
   ```powershell
docker compose -f compose.yaml restart mysql
```
3. Start Spring Boot again.

Do not delete the Docker volume unless you want to wipe local database files.

---

# 36. ⚠️ Full Database Reset

This destroys local MySQL data.

```powershell
docker compose -f compose.yaml down -v
docker compose -f compose.yaml up -d mysql
```

Consequences:
- database data deleted
- container recreated
- volume recreated
- seed logic may re-run when the app starts

---

# 37. Building the Project

Windows:
```powershell
.\mvnw.cmd clean package
```

macOS/Linux:
```bash
./mvnw clean package
```

- `clean`: removes previous build artifacts
- `package`: compiles code and builds the JAR

---

# 38. Running Tests

Windows:
```powershell
.\mvnw.cmd test
```

macOS/Linux:
```bash
./mvnw test
```

This runs the project's automated tests.

---

# 39. Running the Compiled JAR

After packaging, run:
```powershell
java -jar target\ApiMarketplace-0.0.1-SNAPSHOT.jar --server.port=8081
```

If port `8081` is in use:
```powershell
java -jar target\ApiMarketplace-0.0.1-SNAPSHOT.jar --server.port=8082
```

---

# 40. Important URLs

| Service | URL |
|---|---|
| Backend | `http://localhost:8081` |
| Swagger UI | `http://localhost:8081/swagger-ui.html` |
| OpenAPI JSON | `http://localhost:8081/v3/api-docs` |
| H2 Console | `http://localhost:8081/h2-console` |

---

# 41. Important Ports

| Service | Port |
|---|---|
| Spring Boot backend | `8081` |
| MySQL Docker host port | `3306` |

---

# 42. Common Commands Cheat Sheet

| Task | Command |
|---|---|
| Clone project | `git clone https://github.com/omphopse/ApiMarketPlace.git` |
| Start MySQL | `docker compose -f compose.yaml up -d mysql` |
| Check containers | `docker compose -f compose.yaml ps` |
| Stop MySQL | `docker compose -f compose.yaml stop mysql` |
| Build project | `.\mvnw.cmd clean package` |
| Run backend | `.\mvnw.cmd spring-boot:run` |
| Run tests | `.\mvnw.cmd test` |
| Run JAR | `java -jar target\ApiMarketplace-0.0.1-SNAPSHOT.jar --server.port=8081` |

---

# 43. Troubleshooting — Docker Not Running

If Docker commands fail, ensure Docker Desktop is started.
Common error: `Cannot connect to the Docker daemon`.

Solution:
- open Docker Desktop
- wait until Docker is ready
- retry `docker compose -f compose.yaml up -d mysql`

---

# 44. Troubleshooting — Port 3306 Already Used

If MySQL fails to start because port `3306` is busy:
- another MySQL instance may already be running
- stop the other service or choose a different host port in `compose.yaml`

Check the port:
```powershell
netstat -ano | findstr :3306
```

---

# 45. Troubleshooting — Port 8081 Already Used

If Spring Boot cannot start on `8081`, check:
```powershell
netstat -ano | findstr :8081
```

Then either stop the process using port `8081` or start the app on another port:
```powershell
.\mvnw.cmd spring-boot:run -Dserver.port=8082
```

---

# 46. Troubleshooting — Database Connection Error

Since the default project config uses H2, database errors are most often related to the local H2 setup.
If you configure MySQL manually, verify:
- MySQL container is running
- host is `localhost`
- port is `3306`
- `SPRING_DATASOURCE_URL`, username, and password are correct

Check Docker status:
```powershell
docker compose -f compose.yaml ps
docker logs api-marketplace-mysql --tail 50
```

---

# 47. Troubleshooting — 401 Unauthorized

A `401` means authentication failed or the token is missing.
Check:
- the `Authorization` header exists
- the token is sent as `Bearer <token>`
- the token from `/api/auth/login` is not expired

---

# 48. Troubleshooting — 403 Forbidden

A `403` means the token is valid but the user does not have the required role.
Example: a consumer calling a provider-only endpoint.

---

# 49. Troubleshooting — Registration Conflict

Duplicate email registration returns an error.
Use a different email when calling `/api/auth/register`.

---

# 50. Troubleshooting — Maven Problems

If Maven fails:
- make sure Java 21 is installed
- run `.\mvnw.cmd clean package`
- if dependency download fails, check your internet connection

---

# 51. Troubleshooting — Docker Database Was Deleted

If you ran `docker compose down -v`, the MySQL volume and all data were deleted.
To recreate:
```powershell
docker compose -f compose.yaml up -d mysql
```

---

# 52. Understanding the Development Environment

- Docker runs the MySQL container.
- Spring Boot runs the Java backend.
- Swagger/Postman sends API requests.
- H2 stores data for the default local run.
- JWT controls protected API access.

---

# 53. Complete First-Time Run Checklist

## First Time Only
- [ ] Clone the project
- [ ] Install Java 21
- [ ] Install Docker Desktop
- [ ] Run `docker compose -f compose.yaml up -d mysql`
- [ ] Build the project with `.\mvnw.cmd clean package`
- [ ] Run `.\mvnw.cmd spring-boot:run`
- [ ] Open `http://localhost:8081/swagger-ui.html`
- [ ] Register a user
- [ ] Login and copy the JWT
- [ ] Test `GET /api/consumer/profile`

---

# 54. Daily Run Checklist

- [ ] Start Docker Desktop
- [ ] Start MySQL with `docker compose -f compose.yaml up -d mysql`
- [ ] Run backend with `.\mvnw.cmd spring-boot:run`
- [ ] Open Swagger at `http://localhost:8081/swagger-ui.html`

---

# 55. Shutdown Checklist

- [ ] Stop Spring Boot with `Ctrl + C`
- [ ] Optionally stop MySQL with `docker compose -f compose.yaml stop mysql`
- [ ] Do not use `docker compose down -v` unless you want to delete MySQL data

---

# 56. New Team Member — Start Here

For a teammate who just cloned the repo:
1. Install Java 21 and Docker Desktop.
2. Clone the repository.
3. Open the project in an IDE.
4. Start the MySQL container if you want the database service available.
5. Run the backend with the Maven wrapper.
6. Open Swagger.
7. Register a user.
8. Login and test a protected endpoint.

## Related documents
- `PROJECT.md`: project design and features.
- `API_TESTING_GUIDE.md`: API test flow details.
- `RUN_GUIDE.md`: local startup and verification steps.

---

# 57. Setup Issues Discovered

- `compose.yaml` defines a MySQL service, but the default application configuration in `src/main/resources/application.properties` uses H2 in-memory database.
- That means the MySQL container is not used by default unless datasource settings are changed.

---

# 58. Notes

- Default admin account is seeded automatically by `DefaultAdminInitializer`.
- The default backend port is `8081`.
- The Swagger UI path is `http://localhost:8081/swagger-ui.html`.
- There is no `.env` file in this repository.
