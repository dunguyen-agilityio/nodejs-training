#!/bin/sh
set -e

echo "Running database migrations..."
pnpm migration:run:prod

echo "Starting server..."
exec pnpm start
