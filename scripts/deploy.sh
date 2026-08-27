#!/usr/bin/env bash

# ==============================================================================
# ShopSmart - Idempotent Production Deployment Script
# ==============================================================================

set -e

# Load nvm and use correct Node version if present
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
command -v nvm &>/dev/null && nvm use default 2>/dev/null || true

APP_DIR="${APP_DIR:-$HOME/shopsmart}"

echo "======================================================================"
echo "      🚀 Starting ShopSmart Deployment at $APP_DIR                    "
echo "======================================================================"

# 1. Directory Structure
echo "=> Ensuring log directories exist..."
mkdir -p "$APP_DIR/logs"

# 2. Navigate to app directory
cd "$APP_DIR" || exit 1

# 3. Pull latest changes
echo "=> Pulling latest changes from main branch..."
git pull origin main || echo "Git pull skipped or failed, continuing deployment..."

# 4. Install dependencies
echo "=> Installing monorepo dependencies..."
pnpm install --frozen-lockfile

# 5. Database Setup
echo "=> Generating Prisma client & running migrations..."
pnpm --filter shopsmart-server db:generate
pnpm --filter shopsmart-server db:migrate

# 6. Build Packages & Apps
echo "=> Building workspace packages and Next.js frontend..."
pnpm turbo run build

# 7. Restart Backend Service safely
echo "=> Restarting Backend Service on Port 5001..."
if lsof -Pi :5001 -sTCP:LISTEN -t >/dev/null ; then
    echo "Port 5001 in use. Terminating existing process safely..."
    lsof -ti :5001 | xargs kill -15 2>/dev/null || true
    sleep 2
fi

if lsof -Pi :5001 -sTCP:LISTEN -t >/dev/null ; then
    lsof -ti :5001 | xargs kill -9 2>/dev/null || true
fi

cd "$APP_DIR/apps/server"
nohup pnpm start > "$APP_DIR/logs/server.log" 2>&1 &
echo "=> Backend started on port 5001 (logs: logs/server.log)."
cd "$APP_DIR"

# 8. Restart Frontend Service safely
echo "=> Restarting Frontend Service on Port 3000..."
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo "Port 3000 in use. Terminating existing process safely..."
    lsof -ti :3000 | xargs kill -15 2>/dev/null || true
    sleep 2
fi

if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    lsof -ti :3000 | xargs kill -9 2>/dev/null || true
fi

cd "$APP_DIR/apps/client"
nohup pnpm start > "$APP_DIR/logs/client.log" 2>&1 &
echo "=> Frontend started on port 3000 (logs: logs/client.log)."
cd "$APP_DIR"

echo "======================================================================"
echo "      ✅ ShopSmart Deployment Completed Successfully!                 "
echo "======================================================================"
