#!/bin/bash

# Exit on error
set -e

# Configuration
APP_URL=${APP_URL:-"http://localhost:3000"}
MAX_RETRIES=5
RETRY_INTERVAL=10

echo "Starting health check for $APP_URL..."

# Function to check endpoint health
check_endpoint() {
  local endpoint=$1
  local description=$2
  
  echo "Checking $description..."
  
  for i in $(seq 1 $MAX_RETRIES); do
    if curl -f "$APP_URL$endpoint" &> /dev/null; then
      echo "✓ $description is healthy"
      return 0
    else
      echo "Attempt $i of $MAX_RETRIES failed. Retrying in $RETRY_INTERVAL seconds..."
      sleep $RETRY_INTERVAL
    fi
  done
  
  echo "✗ $description health check failed"
  return 1
}

# Check main endpoints
check_endpoint "/" "Main application"
check_endpoint "/api/health" "API"
check_endpoint "/api/auth/status" "Authentication service"
check_endpoint "/api/donation/status" "Donation service"

# Check database connection
echo "Checking database connection..."
npx prisma db execute --stdin "SELECT 1" > /dev/null

# Check Redis connection if used
if [ ! -z "$REDIS_URL" ]; then
  echo "Checking Redis connection..."
  redis-cli ping > /dev/null
fi

echo "All health checks passed successfully!"
