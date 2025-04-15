#!/bin/bash

echo "Waiting for PostgreSQL to be ready..."
until pg_isready -p 5432 -U postgres; do
  echo "PostgreSQL not ready, retrying..."
  sleep 5
done

echo "PostgreSQL is ready. Running initialization tasks..."

# Create the custom user if it doesn't exist
psql -v ON_ERROR_STOP=1 -U postgres <<-EOSQL
  DO \$\$
  BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_catalog.pg_user WHERE usename = '${DB_USERNAME}') THEN
      CREATE USER ${DB_USERNAME} WITH PASSWORD '${DB_PASSWORD}';
      ALTER USER ${DB_USERNAME} WITH SUPERUSER;
    END IF;
  END
  \$\$;
EOSQL

# Check if the custom database exists; if not, create it outside of a DO block
DB_EXISTS=$(psql -U postgres -tAc "SELECT 1 FROM pg_database WHERE datname='${DB_NAME}'")
if [ "$DB_EXISTS" != "1" ]; then
  echo "Creating custom database..."
  psql -v ON_ERROR_STOP=1 -U postgres <<-EOSQL
    CREATE DATABASE ${DB_NAME} WITH OWNER ${DB_USERNAME};
EOSQL
fi

# Install the pgvector extension in the custom database
psql -v ON_ERROR_STOP=1 -U postgres -d ${DB_NAME} <<-EOSQL
  CREATE EXTENSION IF NOT EXISTS vector;
EOSQL

echo "Database initialization complete."

