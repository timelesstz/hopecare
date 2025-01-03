#!/bin/bash

# Exit on error
set -e

APP_URL=${APP_URL:-"http://localhost:3000"}

echo "Starting cache warm-up..."

# Array of critical paths to warm up
PATHS=(
  "/"
  "/programs"
  "/projects"
  "/donate"
  "/about"
  "/api/programs"
  "/api/projects"
  "/api/stats"
)

# Warm up each path
for path in "${PATHS[@]}"; do
  echo "Warming up $APP_URL$path..."
  curl -s "$APP_URL$path" > /dev/null
  sleep 1
done

echo "Cache warm-up completed!"
