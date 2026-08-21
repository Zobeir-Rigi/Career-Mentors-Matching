# Career Mentors Matching

A mentor matching platform for CodeYourFuture that helps trainees connect with suitable volunteer career mentors.

## Project Goal

CodeYourFuture currently manages mentor matching using spreadsheets. This process can be difficult to maintain, can lead to outdated information, and does not provide the best user experience.

This project aims to provide a platform where mentors and mentees can create profiles, be matched using predefined criteria, and manage mentor-mentee relationships more effectively.

## MVP Features

- Mentor profile management
- Mentee profile management
- Matching based on selected criteria
- Match acceptance and rejection workflow
- Staff visibility of mentor-mentee matches and relationship status

## Live Application

### Frontend

https://mm.trainees.hosting.cyf.academy

### Backend API

https://xmlgxcre4zu1pq3mcl5pf7o7.trainees.hosting.cyf.academy

### API Documentation

https://xmlgxcre4zu1pq3mcl5pf7o7.trainees.hosting.cyf.academy/api/docs

## Tech Stack

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS

### Backend

- NestJS
- TypeScript
- Prisma ORM
- PostgreSQL

### Deployment

- Docker
- Coolify

## Project Structure

```text
.
├── client/
├── docs/
├── server/
├── CONTRIBUTING.md
└── README.md
```

## Getting Started

### Prerequisites

- Node.js
- npm
- Docker

### Start the Database

The PostgreSQL database is configured in the `server` directory.

```bash
cd server
docker compose up -d
```

This uses the `docker-compose.yml` file located in the `server` directory.
```

### Backend Setup

```bash
cd server
npm install
npm run start:dev
```

The backend will run on:

```text
http://localhost:3000
```

### Frontend Setup

```bash
cd client
npm install
npm run dev
```

The frontend will run on:

```text
http://localhost:5173
```

### API Documentation

Swagger documentation is available at:

```text
http://localhost:3000/api/docs
```

## Documentation

Additional project documentation can be found in the `docs` directory:

- `api.md` - API documentation and Swagger links
- `database.md` - Database and Prisma documentation
- `deployment.md` - Deployment and Coolify configuration
- `architecture.md` - System architecture overview

## Known Limitations

This project is currently an MVP and does not include all planned functionality.

## Future Improvements

## Contributors

Built by CodeYourFuture trainees as part of the Career Mentors Matching project.