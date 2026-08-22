# Architecture

## Overview

The application follows a three-tier architecture consisting of:

- Frontend: React, TypeScript, Vite, Tailwind CSS
- Backend: NestJS, TypeScript, Prisma ORM
- Database: PostgreSQL

## System Architecture

```text
┌─────────────────────────┐
│        Frontend         │
│ React • TypeScript      │
│ Vite • Tailwind CSS     │
└───────────┬─────────────┘
            │ HTTP Requests
            ▼
┌─────────────────────────┐
│         Backend         │
│ NestJS • TypeScript     │
│ Prisma ORM              │
└───────────┬─────────────┘
            │ Database Queries
            ▼
┌─────────────────────────┐
│       PostgreSQL        │
│        Database         │
└─────────────────────────┘
```

## Data Flow

1. Users interact with the frontend application.
2. The frontend sends requests to the backend API.
3. The backend validates and processes requests.
4. Prisma ORM communicates with the PostgreSQL database.
5. The backend returns data to the frontend.
6. The frontend displays the results to the user.

## Deployment Architecture

- Frontend hosted on Coolify.
- Backend hosted on Coolify.
- PostgreSQL database hosted on Coolify.
- Frontend and backend are deployed using Docker containers.