#!/usr/bin/env bash

# ==============================================================================
# ShopSmart - Initial Project Setup Script
# ==============================================================================

set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "=> Starting ShopSmart project setup..."

# 1. Install workspace dependencies
echo "=> Installing workspace dependencies via pnpm..."
pnpm install

# 2. Environment Files
if [ ! -f "apps/server/.env" ]; then
  echo "=> Creating apps/server/.env from .env.example..."
  cp apps/server/.env.example apps/server/.env
else
  echo "=> apps/server/.env already exists."
fi

if [ ! -f "apps/client/.env" ]; then
  echo "=> Creating apps/client/.env from .env.example..."
  cp apps/client/.env.example apps/client/.env
else
  echo "=> apps/client/.env already exists."
fi

# 3. Generate Prisma Client
echo "=> Generating Prisma Client..."
pnpm --filter shopsmart-server db:generate

echo "=> Setup completed successfully! You can now run 'pnpm run dev' to start the application."
exit 0