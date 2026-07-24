# Mentor Matching Backend

Backend API for the Mentor Matching application, built with **NestJS**, **Prisma ORM**, and **PostgreSQL**.

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

---

## Getting Started

### 1. Clone the repository

```bash
git clone <[repo](https://github.com/Zobeir-Rigi/Career-Mentors-Matching)>
cd server
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create your environment file

Copy the example environment file:

```bash
cp .env.example .env
```

Update the values if necessary.

---

## Running PostgreSQL

Start the local PostgreSQL database:

```bash
docker compose up -d
```

Verify it's running:

```bash
docker compose ps
```

To stop the database:

```bash
docker compose down
```

---

## Prisma Setup

Generate the Prisma Client:

```bash
npx prisma generate
```

Run database migrations:

```bash
npx prisma migrate dev
```

---

## Running the Application

Start the development server:

```bash
npm run start:dev
```

The API will be available at:

```
http://localhost:3000
```

To build the project:

```bash
npm run build
```

Run the compiled application:

```bash
npm run start:prod
```

---

## API Endpoints

| Method | Endpoint    | Description                    |
| ------ | ----------- | ------------------------------ |
| GET    | `/hello`    | Returns a Hello World response |
| GET    | `/health`   | Checks API and database health |
| GET    | `/api/docs` | Swagger API documentation      |

---

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

---

## Code Quality

Lint the project:

```bash
npm run lint
```

Automatically format the code:

```bash
npm run format
```

---

## Project Structure

```
src/
├── hello/
├── health/
├── prisma/
├── generated/
├── app.module.ts
└── main.ts

prisma/
├── migrations/
└── schema.prisma

docker-compose.yml
```

---

## Tech Stack

- NestJS
- Prisma ORM
- PostgreSQL
- Docker
- Jest
- Swagger

---

## Development Workflow

After pulling the latest changes:

```bash
npm install
docker compose up -d
npx prisma generate
npx prisma migrate dev
npm run start:dev
```

---

## Useful Commands

| Command              | Description                  |
| -------------------- | ---------------------------- |
| `npm run start:dev`  | Start development server     |
| `npm run build`      | Build the application        |
| `npm run start:prod` | Run the compiled application |
| `npm test`           | Run all tests                |
| `npm run test:cov`   | Generate coverage report     |
| `npm run typecheck`  | Run TypeScript type checking |
| `npm run lint`       | Lint the project             |
| `npm run format`     | Format source files          |

---
