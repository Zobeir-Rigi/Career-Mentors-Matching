# Database Documentation

## Overview

This project uses PostgreSQL as the database and Prisma as the ORM.

Prisma is responsible for managing the database schema, relationships, and migrations.

## Local Development Database

A PostgreSQL database is provided locally using Docker Compose.

Start the database:

```bash
docker compose up -d
```

The database configuration is defined in:

```text
docker-compose.yml
```

## Schema

The source of truth for the database structure is:

```text
prisma/schema.prisma
```

All models, fields, and relationships should be maintained in this file.

## Database Migrations

Database changes are managed using Prisma Migrate.

### Create a Migration

```bash
npx prisma migrate dev
```

### Apply Migrations

```bash
npx prisma migrate deploy
```

## Useful Commands

### Generate Prisma Client

```bash
npx prisma generate
```

### Open Prisma Studio

```bash
npx prisma studio
```

## Notes

- PostgreSQL is used as the primary database.
- Local development uses Docker Compose to run PostgreSQL.
- Schema changes should always be accompanied by a migration.
- The Prisma schema file should be treated as the primary reference for database structure and relationships.