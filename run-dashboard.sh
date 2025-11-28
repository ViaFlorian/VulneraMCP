#!/bin/bash

# Simple wrapper to run dashboard with correct environment variables

export POSTGRES_PASSWORD='12345'
export POSTGRES_HOST=localhost
export POSTGRES_PORT=5433  # PostgreSQL 18 uses port 5433
export POSTGRES_USER=postgres  # PostgreSQL installer creates 'postgres' superuser
export POSTGRES_DB=bugbounty

cd "$(dirname "$0")"
node dashboard-server.js

