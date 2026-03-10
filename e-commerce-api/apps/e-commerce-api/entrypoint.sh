#!/bin/sh
set -e
echo "Starting e-commerce-api entrypoint..."

# Ensure production condition is set for Node.js subpath imports
export NODE_OPTIONS="--conditions=production"

echo "Running migrations..."
node --conditions=production --import tsx \
  /usr/src/app/node_modules/typeorm/cli.js \
  migration:run -d ./src/database/data-source.ts

# Run seed data if requested
if [ "$SEED_DATA" = "true" ]; then
    echo "Seeding database..."
    node --conditions=production --import tsx \
      /usr/src/app/node_modules/typeorm/cli.js \
      migration:run -d ./src/database/seed-data-source.ts
fi

# Start the application (migrations run inside the app when RUN_MIGRATIONS=true)
echo "Starting application..."
exec node --conditions=production --import tsx build/server.js
