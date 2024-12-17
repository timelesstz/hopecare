#!/bin/bash

# Exit on error
set -e

echo "Starting deployment process..."

# 1. Environment Validation
if [ -z "$NODE_ENV" ]; then
  echo "ERROR: NODE_ENV is not set"
  exit 1
fi

if [ -z "$DATABASE_URL" ]; then
  echo "ERROR: DATABASE_URL is not set"
  exit 1
fi

# 2. Install Dependencies
echo "Installing dependencies..."
npm ci

# 3. Database Migration
echo "Running database migrations..."
npx prisma migrate deploy

# 4. Build Application
echo "Building application..."
npm run build

# 5. Run Tests
echo "Running tests..."
npm run test:ci

# 6. Security Checks
echo "Running security checks..."
npm audit
npx snyk test

# 7. Optimize Assets
echo "Optimizing assets..."
npm run optimize

# 8. Deploy Application
echo "Deploying application..."
if [ "$NODE_ENV" = "production" ]; then
  # Production deployment
  pm2 stop hopecare || true
  pm2 delete hopecare || true
  pm2 start npm --name "hopecare" -- start
else
  # Staging deployment
  pm2 stop hopecare-staging || true
  pm2 delete hopecare-staging || true
  pm2 start npm --name "hopecare-staging" -- start
fi

# 9. Health Check
echo "Performing health check..."
./scripts/health-check.sh

# 10. Cache Warm-up
echo "Warming up cache..."
./scripts/cache-warmup.sh

echo "Deployment completed successfully!"
