# Career Mentors Matching

A mentor matching platform for CodeYourFuture that helps trainees connect with suitable volunteer career mentors.

## Project Goal

CodeYourFuture currently manages mentor matching using spreadsheets. This process can be difficult to maintain, can lead to outdated information, and does not provide the best user experience.

This project aims to provide a platform where mentors and mentees can create profiles, be matched using predefined criteria, and manage mentor-mentee matches more effectively.

## MVP Features

- Mentor profiles
- Mentee profiles
- Matching based on selected criteria
- Match acceptance or rejection
- Staff visibility of mentor-mentee matches
- Secure storage of user data

## Tech Stack

### Frontend

- React
- JavaScript
- Vite
- Tailwind CSS

### Backend

- NestJS
- TypeScript
- Prisma
- PostgreSQL

## Deployment

- Docker
- Coolify

Frontend and backend are deployed as separate services using their own Dockerfiles.

## Project Structure

```text
.
├── client/
├── docs/
├── server/
├── CONTRIBUTING.md
└── README.md

## Documentation

Additional project documentation can be found in the `docs` directory.

- `api.md` – API endpoints and request/response documentation
- `database.md` – Database schema and Prisma models