# Hares AI Deployment Guide

This guide provides instructions for deploying the Hares AI Control Plane to a production environment.

## 🚀 Production Deployment

The Control Plane is containerized using Docker and orchestrated via Docker Compose.

### 1. Environment Variables
Create a `.env` file in the root directory with the following variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Connection string for PostgreSQL | `postgresql://user:pass@db_host:5432/hares_db` |
| `REDIS_URL` | Connection string for Redis | `redis://redis_host:6379/0` |
| `SENTRY_DSN` | Sentry DSN for error tracking | `https://xyz@sentry.io/123` |
| `SECRET_KEY` | Secret key for JWT signing | `your-super-secret-key` |
| `POSTGRES_USER` | Database user | `postgres` |
| `POSTGRES_PASSWORD` | Database password | `securepassword` |
| `POSTGRES_DB` | Database name | `hares_db` |

### 2. Deployment Steps

1. **Clone the Repository**:
   ```bash
   git clone <repo-url>
   cd hares-ai
   ```

2. **Configure Environment**:
   Copy `.env.example` to `.env` and fill in the production values.

3. **Launch Production Stack**:
   ```bash
   docker-compose -f docker-compose.prod.yml up -d --build
   ```

4. **Verify Deployment**:
   Check the logs to ensure migrations ran successfully and the app is healthy:
   ```bash
   docker logs -f hares_cp_prod
   ```

### 3. CI/CD Pipeline
The project uses GitHub Actions for continuous integration. Every push to `main` and pull request triggers:
- Python security scan (`bandit`)
- Linting (`flake8`)
- Backend test suite (`pytest`)
- Extension JS syntax validation

## 🛠️ Troubleshooting
- **DB Migrations**: If migrations fail, check the logs of `hares_cp_prod`. You can manually run migrations using:
  `docker exec -it hares_cp_prod python -m alembic upgrade head`
- **Health Checks**: The `cp-prod` service depends on the DB and Redis health checks. If it doesn't start, verify that the DB and Redis containers are healthy.
