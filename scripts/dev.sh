#!/usr/bin/env bash

# ==============================================================================
# ShopSmart - Full-Stack Local Development Runner
# 1. Releases ports (3000, 5001)
# 2. Ensures Redis is running (6379)
# 3. Validates environment configurations
# 4. Builds all packages & generates Prisma client
# 5. Starts Next.js Frontend & Express Backend concurrently
# ==============================================================================

set -e

# Colors for terminal output
BOLD="\033[1m"
GREEN="\033[0;32m"
BLUE="\033[0;34m"
YELLOW="\033[1;33m"
CYAN="\033[0;36m"
RED="\033[0;31m"
NC="\033[0m" # No Color

echo -e "${BOLD}${CYAN}=====================================================${NC}"
echo -e "${BOLD}${CYAN}           🛒 Starting ShopSmart Monorepo           ${NC}"
echo -e "${BOLD}${CYAN}=====================================================${NC}"

# Navigate to project root
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

# ------------------------------------------------------------------------------
# 1. Kill Occupied Ports (3000 for Frontend, 5001 for Backend)
# ------------------------------------------------------------------------------
kill_port_if_busy() {
  local port=$1
  local name=$2
  local pids=$(lsof -ti :"$port" 2>/dev/null || true)
  
  if [ -n "$pids" ]; then
    echo -e "${YELLOW}⚠️  Port $port ($name) is currently in use. Releasing port...${NC}"
    kill -15 $pids 2>/dev/null || true
    sleep 1
    # Force kill if still lingering
    local remaining_pids=$(lsof -ti :"$port" 2>/dev/null || true)
    if [ -n "$remaining_pids" ]; then
      kill -9 $remaining_pids 2>/dev/null || true
    fi
    echo -e "${GREEN}✓ Port $port released.${NC}"
  fi
}

echo -e "${BLUE}🔍 Checking port availability...${NC}"
kill_port_if_busy 5001 "Backend API"
kill_port_if_busy 3000 "Frontend Client"

# ------------------------------------------------------------------------------
# 2. Ensure Redis is Running
# ------------------------------------------------------------------------------
echo -e "${BLUE}🔍 Checking Redis service (port 6379)...${NC}"
is_redis_running() {
  if command -v redis-cli &>/dev/null; then
    redis-cli ping 2>/dev/null | grep -q "PONG" && return 0
  fi
  if command -v nc &>/dev/null; then
    nc -z 127.0.0.1 6379 2>/dev/null && return 0
  fi
  return 1
}

if is_redis_running; then
  echo -e "${GREEN}✓ Redis is active and running on port 6379.${NC}"
else
  echo -e "${YELLOW}⚡ Redis is not running. Starting Redis server...${NC}"
  if command -v redis-server &>/dev/null; then
    redis-server --daemonize yes 2>/dev/null || redis-server &
    sleep 1
  elif command -v docker &>/dev/null; then
    echo -e "${BLUE}🐳 Starting Redis via Docker container...${NC}"
    if docker ps -a --format '{{.Names}}' | grep -q "^shopsmart-redis$"; then
      docker start shopsmart-redis >/dev/null 2>&1 || true
    else
      docker run -d --name shopsmart-redis -p 6379:6379 redis:alpine >/dev/null 2>&1 || true
    fi
    sleep 1
  else
    echo -e "${YELLOW}⚠️  Could not start Redis automatically (neither redis-server nor docker found). Backend will continue with DB fallback.${NC}"
  fi

  if is_redis_running; then
    echo -e "${GREEN}✓ Redis started successfully on port 6379.${NC}"
  else
    echo -e "${YELLOW}⚠️  Redis is not responding on 6379. Backend will use fallback mode.${NC}"
  fi
fi

# ------------------------------------------------------------------------------
# 3. Check & Setup Environment Files
# ------------------------------------------------------------------------------
if [ ! -f "apps/server/.env" ]; then
  echo -e "${YELLOW}⚠️  apps/server/.env not found. Creating from .env.example...${NC}"
  cp apps/server/.env.example apps/server/.env
fi

if [ ! -f "apps/client/.env" ]; then
  echo -e "${YELLOW}⚠️  apps/client/.env not found. Creating from .env.example...${NC}"
  cp apps/client/.env.example apps/client/.env
fi

# ------------------------------------------------------------------------------
# 4. Generate Prisma Client & Build Monorepo
# ------------------------------------------------------------------------------
echo -e "${BLUE}🔧 Generating Prisma client...${NC}"
pnpm --filter shopsmart-server db:generate

echo -e "${BLUE}🔨 Building packages before starting dev servers...${NC}"
pnpm turbo run build

# ------------------------------------------------------------------------------
# 5. Trap Signals for Graceful Cleanup
# ------------------------------------------------------------------------------
cleanup() {
  echo ""
  echo -e "${YELLOW}🛑 Stopping ShopSmart development servers...${NC}"
  kill 0 2>/dev/null || true
  wait 2>/dev/null || true
  echo -e "${GREEN}✅ All services cleanly stopped.${NC}"
  exit 0
}

trap cleanup SIGINT SIGTERM EXIT

# ------------------------------------------------------------------------------
# 6. Start Backend & Frontend Concurrently
# ------------------------------------------------------------------------------
echo -e "${BOLD}${GREEN}🚀 Starting Backend (http://localhost:5001) & Frontend (http://localhost:3000)...${NC}"
echo ""

pnpm --filter shopsmart-server dev &
SERVER_PID=$!

pnpm --filter shopsmart-frontend dev &
CLIENT_PID=$!

wait $SERVER_PID $CLIENT_PID
