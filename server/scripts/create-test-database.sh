#!/usr/bin/env bash

set -euo pipefail

DATABASE_NAME="mentor_matching_test"

echo "Checking for test database: $DATABASE_NAME"

DATABASE_EXISTS=$(
  docker compose exec -T postgres \
    psql -U postgres -d postgres -tAc \
    "SELECT 1 FROM pg_database WHERE datname = '$DATABASE_NAME';"
)

if [ "$DATABASE_EXISTS" = "1" ]; then
  echo "Test database already exists."
else
  echo "Creating test database..."
  docker compose exec -T postgres \
    psql -U postgres -d postgres \
    -c "CREATE DATABASE $DATABASE_NAME;"

  echo "Test database created."
fi
