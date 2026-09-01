# Mentor Matching Backend

Backend API for the Career Mentors Matching application, built with NestJS, Prisma ORM, and PostgreSQL.

## Tech Stack

- NestJS
- TypeScript
- Prisma ORM
- PostgreSQL
- Docker
- Jest
- Swagger

## Prerequisites

Before getting started, ensure you have the following installed:

- Node.js (v22 or later recommended)
- npm
- Docker
- Docker Compose

Verify your installations:

```bash
node -v
npm -v
docker --version
docker compose version
```

## Getting Started

### Clone the Repository

```bash
git clone https://github.com/Zobeir-Rigi/Career-Mentors-Matching.git
cd Career-Mentors-Matching/server
```

### Install Dependencies

```bash
npm install
```

### Create Your Environment File

Copy the example environment file:

```bash
cp .env.example .env
```

Update the values if necessary.

## Running PostgreSQL

Start the local PostgreSQL database:

```bash
docker compose up -d
```

Verify it is running:

```bash
docker compose ps
```

To stop the database:

```bash
docker compose down
```

## Prisma Setup

Generate the Prisma Client:

```bash
npx prisma generate
```

Run database migrations:

```bash
npx prisma migrate dev
```

## Running the Application

Start the development server:

```bash
npm run start:dev
```

The API will be available at:

```text
http://localhost:3000
```

### Swagger Documentation

```text
http://localhost:3000/api/docs
```

### Health Check

```text
http://localhost:3000/health
```

### Build the Application

```bash
npm run build
```

### Run the Production Build

```bash
npm run start:prod
```

## Testing

Run all tests:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

Run tests with coverage:

```bash
npm run test:cov
```

Run TypeScript type checking:

```bash
npm run typecheck
```

## Code Quality

Lint the project:

```bash
npm run lint
```

Automatically format the code:

```bash
npm run format
```

## Project Structure

```text
src/
├── auth/
├── common/
├── generated/
├── health/
├── hello/
├── mail/
├── matching/
├── mentee/
├── mentors/
├── prisma/
├── admin/
├── app.module.ts
└── main.ts

prisma/
├── migrations/
└── schema.prisma

docker-compose.yml
```

## Development Workflow

After pulling the latest changes:

```bash
npm install
docker compose up -d
npx prisma generate
npx prisma migrate dev
npm run start:dev
```

## Useful Commands

- `npm run start:dev` - Start the development server
- `npm run build` - Build the application
- `npm run start:prod` - Run the compiled application
- `npm test` - Run all tests
- `npm run test:cov` - Generate a coverage report
- `npm run typecheck` - Run TypeScript type checking
- `npm run lint` - Lint the project
- `npm run format` - Format source files