#!/bin/sh
set -e

echo "=========================================="
echo " Dhaka Tesla Pool API — Container Startup "
echo "=========================================="

echo "==> Deploying Prisma migrations..."
npx prisma migrate deploy

echo "==> Seeding initial data (if needed)..."
npx tsx prisma/seed.ts || echo "==> Seeding completed or already seeded."

echo "==> Starting Dhaka Tesla Pool API server..."
exec "$@"
