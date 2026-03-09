#!/bin/sh
set -e
echo "Starting e-commerce-api entrypoint..."

# Ensure production condition is set for Node.js subpath imports
export NODE_OPTIONS="--conditions=production"

# Run database migrations
echo "Running database migrations..."
pnpm run migration:run:prod

# Run seed data if requested
if [ "$SEED_DATA" = "true" ]; then
    echo "Seeding database..."
    pnpm run seed-data:prod
fi

# Start the application
echo "Starting application..."
pnpm run start
