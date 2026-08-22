# Deployment Documentation

## Overview

The application is hosted on Coolify and consists of three services:

- Frontend application
- Backend API
- PostgreSQL database

The frontend and backend are deployed using Docker containers, and the production database is hosted on Coolify.

## Production URLs

### Frontend

https://mm.trainees.hosting.cyf.academy

### Backend API

https://xmlgxcre4zu1pq3mcl5pf7o7.trainees.hosting.cyf.academy

### Health Check

https://xmlgxcre4zu1pq3mcl5pf7o7.trainees.hosting.cyf.academy/health

### API Documentation

https://xmlgxcre4zu1pq3mcl5pf7o7.trainees.hosting.cyf.academy/api/docs

## Deployment Platform

The application is deployed using Coolify.

- Frontend is deployed as a Docker container.
- Backend is deployed as a Docker container.
- PostgreSQL is hosted on Coolify.
- Deployments are triggered manually through Coolify after changes are merged into the develop branch.

## Frontend Configuration

Required environment variables:

```env
VITE_API_URL=
```

Example:

```env
VITE_API_URL=https://xmlgxcre4zu1pq3mcl5pf7o7.trainees.hosting.cyf.academy
```

## Backend Configuration

Required environment variables:

```env
DATABASE_URL=
NODE_ENV=production
PORT=3000
FRONTEND_URL=
JWT_SECRET=
JWT_EXPIRES_IN=1d
AUTH_COOKIE_MAX_AGE_MS=86400000
EMAIL_PROVIDER=
EMAIL_FROM=
```
# Required when EMAIL_PROVIDER=ses

AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=eu-west-1

### Email Configuration

When `EMAIL_PROVIDER=ses`, valid AWS SES credentials must be configured.

If SES credentials are missing, user accounts will still be created successfully, but verification and password reset emails will not be sent.

## Deployment Process

1. Merge approved changes into the develop branch.
2. Open the relevant service in Coolify.
3. Trigger a manual redeployment.
4. Coolify rebuilds the Docker image using the project's Dockerfile.
5. Coolify deploys the updated container.
6. Verify the deployment using the application URLs and API documentation.

## Local Development Database

A local PostgreSQL database can be started using Docker Compose:

```bash
docker compose up -d
```

The database configuration is defined in:

```text
docker-compose.yml
```

## Verification Checklist

After deployment, verify that:

- The frontend application loads successfully.
- The backend API is reachable.
- Swagger documentation is accessible.
- Database connectivity is working.
- Authentication functions correctly.