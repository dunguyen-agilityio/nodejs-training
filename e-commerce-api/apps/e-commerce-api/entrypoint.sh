#!/bin/sh
set -e
echo "Starting e-commerce-api entrypoint..."

# Run database migrations
echo "Running database migrations..."
pnpm run migration:run:prod

# Run seed data if requested
if [ "$SEED_DATA" = "true" ]; then
    echo "Seeding database..."
    pnpm run seed-data
fi

# Start the application
echo "Starting application..."
pnpm run start
