# Contributing

Thank you for contributing to this project.

## Branches

This project uses the following branches:

- `main` – stable code
- `develop` – development branch

Create a new branch from `develop` for every task.

Example:

```bash
git checkout develop
git pull origin develop
git checkout -b feature/create-mentor-profile
```

## Branch Naming

Use descriptive branch names that explain the work being done.

Examples:

```text
feature/create-mentor-profile
feature/create-mentee-profile
fix/profile-validation
docs/update-api-documentation
```

## Pull Requests

Before creating a Pull Request:

- Test your changes
- Write a clear description of what was changed
- Explain how reviewers can test your work

All Pull Requests should target the `develop` branch.

## Commit Messages

Use clear and meaningful commit messages.

Examples:

```text
feat: add mentor profile form
fix: correct email validation
docs: update API documentation
chore: configure eslint
```

Avoid messages such as:

```text
update
fix
changes
work
```

## Code Reviews

Review feedback should be addressed before merging.

Ask another team member to review your Pull Request before merging.

## Deployment

The frontend and backend are deployed separately using Docker and Coolify.

Only tested and reviewed code should be merged into `main`.