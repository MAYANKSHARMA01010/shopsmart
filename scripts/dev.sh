#!/usr/bin/env bash

# ==============================================================================
# ShopSmart - Full-Stack Local Development & Container Orchestration Runner
# 1. Releases occupied host ports (3000, 5001, 6969, 9696)
# 2. Ensures Redis is running (Port 6379)
# 3. Provision & Start WAHA WhatsApp Container (Port 6969 -> 3000)
# 4. Provision & Start Android SMS Gateway Container (Port 9696 -> 8080)
# 5. Validates environment configurations & secrets
# 6. Builds shared packages & generates Prisma client
# 7. Starts Next.js Frontend & Express Backend concurrently with live dashboard
# ==============================================================================

set -e

# Colors for terminal output
BOLD="\033[1m"
GREEN="\033[0;32m"
BLUE="\033[0;34m"
YELLOW="\033[1;33m"
CYAN="\033[0;36m"
MAGENTA="\033[0;35m"
RED="\033[0;31m"
NC="\033[0m" # No Color

echo -e "${BOLD}${CYAN}======================================================================${NC}"
echo -e "${BOLD}${CYAN}            🛒 ShopSmart Local Development & Services Runner           ${NC}"
echo -e "${BOLD}${CYAN}======================================================================${NC}"

# Navigate to project root
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

# ------------------------------------------------------------------------------
# Helper: Safe Environment Variable Reader (Prefers apps/server/.env, then root .env)
# ------------------------------------------------------------------------------
get_env_val() {
  local key=$1
  local val=""
  if [ -f "$ROOT_DIR/apps/server/.env" ]; then
    val=$(grep -E "^${key}=" "$ROOT_DIR/apps/server/.env" | head -n1 | cut -d '=' -f2- | tr -d '"' | tr -d "'" | tr -d '\r')
  fi
  if [ -z "$val" ] && [ -f "$ROOT_DIR/.env" ]; then
    val=$(grep -E "^${key}=" "$ROOT_DIR/.env" | head -n1 | cut -d '=' -f2- | tr -d '"' | tr -d "'" | tr -d '\r')
  fi
  echo "$val"
}

# Resolve Ports & URLs from environment
SERVER_PORT=$(get_env_val "SERVER_PORT")
FRONTEND_PORT=$(get_env_val "FRONTEND_PORT")
WAHA_PORT=$(get_env_val "WAHA_PORT")
REDIS_PORT="6379"

SERVER_PORT="${SERVER_PORT:-5001}"
FRONTEND_PORT="${FRONTEND_PORT:-3000}"
WAHA_PORT="${WAHA_PORT:-6969}"

WAHA_LOCAL_API_URL=$(get_env_val "WAHA_LOCAL_API_URL")
WAHA_API_KEY=$(get_env_val "WAHA_API_KEY")
WAHA_SESSION=$(get_env_val "WAHA_SESSION")
WAHA_DASHBOARD_USERNAME=$(get_env_val "WAHA_DASHBOARD_USERNAME")
WAHA_DASHBOARD_PASSWORD=$(get_env_val "WAHA_DASHBOARD_PASSWORD")
SMS_GATEWAY_URL=$(get_env_val "SMS_GATEWAY_URL")
FRONTEND_LOCAL_URL=$(get_env_val "FRONTEND_LOCAL_URL")
BACKEND_LOCAL_URL=$(get_env_val "BACKEND_LOCAL_URL")

# ------------------------------------------------------------------------------
# Helper: Ensure Docker Daemon is Running (Auto-launches on macOS / Linux)
# ------------------------------------------------------------------------------
is_docker_available() {
  if command -v docker &>/dev/null && docker info &>/dev/null; then
    return 0
  fi
  return 1
}

ensure_docker_running() {
  if is_docker_available; then
    echo -e "${GREEN}✓ Docker engine is active and running.${NC}"
    return 0
  fi

  echo -e "${YELLOW}⚡ Docker daemon is not running. Attempting to launch Docker automatically...${NC}"

  # macOS auto-launch
  if [[ "$OSTYPE" == "darwin"* ]]; then
    if [ -d "/Applications/Docker.app" ] || [ -d "$HOME/Applications/Docker.app" ] || [ -d "/System/Volumes/Data/Applications/Docker.app" ]; then
      echo -e "${BLUE}🐳 Launching Docker Desktop for macOS...${NC}"
      open -g -a Docker 2>/dev/null || open -a Docker 2>/dev/null || true
    fi
  elif command -v systemctl &>/dev/null; then
    # Linux systemd auto-start
    echo -e "${BLUE}🐳 Starting Docker service (systemctl)...${NC}"
    sudo systemctl start docker 2>/dev/null || true
  fi

  # Wait for Docker engine to become responsive (up to 30 seconds with progress dots)
  local max_attempts=30
  local count=0
  echo -ne "${BLUE}⏳ Waiting for Docker engine to initialize${NC}"
  while [ $count -lt $max_attempts ]; do
    if docker info &>/dev/null; then
      echo -e "\n${GREEN}✓ Docker engine is ready and responsive.${NC}"
      return 0
    fi
    echo -ne "."
    sleep 1
    count=$((count + 1))
  done

  echo -e "\n${YELLOW}⚠️  Docker Desktop took longer than 30s to initialize. Continuing with fallback mode...${NC}"
  return 1
}

# Run Docker auto-start check
ensure_docker_running || true

# ------------------------------------------------------------------------------
# 1. Release Occupied Host Ports (Node.js apps only, leaves Docker intact)

# ------------------------------------------------------------------------------
kill_port_if_busy() {
  local port=$1
  local name=$2
  
  # Find PIDs listening on port
  local pids=$(lsof -ti :"$port" 2>/dev/null || true)
  
  if [ -n "$pids" ]; then
    # Check if PID belongs to a docker-proxy process; if so, skip killing
    local is_docker=false
    for pid in $pids; do
      local proc_name=$(ps -p "$pid" -o comm= 2>/dev/null || true)
      if [[ "$proc_name" =~ (docker|com.docker) ]]; then
        is_docker=true
        break
      fi
    done

    if [ "$is_docker" = false ]; then
      echo -e "${YELLOW}⚠️  Port $port ($name) occupied by non-docker process. Releasing...${NC}"
      kill -15 $pids 2>/dev/null || true
      sleep 1
      local remaining_pids=$(lsof -ti :"$port" 2>/dev/null || true)
      if [ -n "$remaining_pids" ]; then
        kill -9 $remaining_pids 2>/dev/null || true
      fi
      echo -e "${GREEN}✓ Port $port released.${NC}"
    fi
  fi
}

echo -e "${BLUE}🔍 Checking port availability for Node.js apps...${NC}"
kill_port_if_busy "$SERVER_PORT" "Backend API"
kill_port_if_busy "$FRONTEND_PORT" "Frontend Client"

# ------------------------------------------------------------------------------
# 2. Ensure Redis Service (Port 6379) - Protocol Verified
# ------------------------------------------------------------------------------
echo -e "${BLUE}🔍 Checking Redis service (port 6379)...${NC}"

is_redis_responsive() {
  # 1. Try redis-cli if available
  if command -v redis-cli &>/dev/null; then
    local pong=$(redis-cli ping 2>/dev/null || true)
    if [[ "$pong" =~ PONG ]]; then
      return 0
    fi
  fi
  
  # 2. Raw TCP Redis RESP protocol check: send PING\r\n, expect +PONG
  if command -v nc &>/dev/null; then
    local resp=$(printf "PING\r\n" | nc -w 1 127.0.0.1 6379 2>/dev/null || true)
    if [[ "$resp" =~ PONG ]]; then
      return 0
    fi
  fi

  return 1
}

if is_redis_responsive; then
  echo -e "${GREEN}✓ Redis is active and responding (PONG) on port 6379.${NC}"
else
  # If port 6379 is occupied by an unresponsive or non-Redis process, release it!
  local busy_pids_6379=$(lsof -ti :6379 2>/dev/null || true)
  if [ -n "$busy_pids_6379" ]; then
    echo -e "${YELLOW}⚠️  Port 6379 is occupied by a non-Redis or unresponsive process. Releasing port 6379...${NC}"
    kill_port_if_busy 6379 "Non-Redis 6379"
    sleep 1
  fi

  echo -e "${YELLOW}⚡ Starting fresh Redis instance...${NC}"
  if command -v redis-server &>/dev/null; then
    redis-server --daemonize yes 2>/dev/null || redis-server &
    sleep 1
  elif is_docker_available; then
    echo -e "${BLUE}🐳 Starting Redis via Docker container (shopsmart-redis)...${NC}"
    if docker ps -a --format '{{.Names}}' | grep -q "^shopsmart-redis$"; then
      # If existing container is stopped or misconfigured, restart it
      docker start shopsmart-redis >/dev/null 2>&1 || {
        docker rm -f shopsmart-redis >/dev/null 2>&1 || true
        docker run -d --name shopsmart-redis -p 6379:6379 --restart unless-stopped redis:alpine >/dev/null 2>&1 || true
      }
    else
      docker run -d --name shopsmart-redis -p 6379:6379 --restart unless-stopped redis:alpine >/dev/null 2>&1 || true
    fi
    sleep 1
  else
    echo -e "${YELLOW}⚠️  Could not start Redis automatically (neither redis-server nor docker found). Backend will continue with DB fallback.${NC}"
  fi

  if is_redis_responsive; then
    echo -e "${GREEN}✓ Redis started and responding (PONG) on port 6379.${NC}"
  else
    echo -e "${YELLOW}⚠️  Redis is not responding on 6379. Backend will use fallback DB mode.${NC}"
  fi
fi


# ------------------------------------------------------------------------------
# 3. Ensure WAHA (WhatsApp HTTP API) Docker Container (Port 6969 -> 3000)
# ------------------------------------------------------------------------------
echo -e "${BLUE}💬 Checking WhatsApp Provider (WAHA) service on port 6969...${NC}"
if is_docker_available; then
  WAHA_IMAGE="devlikeapro/waha:latest"
  WAHA_CONTAINER="shopsmart-waha"
  
  # Check if container is already running
  if docker ps --format '{{.Names}}' | grep -q "^${WAHA_CONTAINER}$"; then
    echo -e "${GREEN}✓ WAHA container is active and running on http://localhost:6969 (Dashboard: /dashboard)${NC}"
  else
    # Check if container exists but stopped
    if docker ps -a --format '{{.Names}}' | grep -q "^${WAHA_CONTAINER}$"; then
      echo -e "${YELLOW}🔄 Starting existing WAHA container (${WAHA_CONTAINER})...${NC}"
      docker start "$WAHA_CONTAINER" >/dev/null 2>&1 || true
    else
      # Check if image is present, if not pull it
      if ! docker images --format '{{.Repository}}' | grep -q "devlikeapro/waha"; then
        echo -e "${YELLOW}📥 Downloading WAHA Docker image (${WAHA_IMAGE})... This may take a moment.${NC}"
        docker pull "$WAHA_IMAGE" || true
      fi
      
      echo -e "${BLUE}🐳 Creating and starting WAHA container on port ${WAHA_PORT}...${NC}"
      docker run -d \
        --name "$WAHA_CONTAINER" \
        -p "${WAHA_PORT}:3000" \
        -v shopsmart-waha-sessions:/app/.sessions \
        -e WHATSAPP_DEFAULT_ENGINE=NOWEB \
        ${WAHA_API_KEY:+-e WAHA_API_KEY="${WAHA_API_KEY}"} \
        ${WAHA_DASHBOARD_USERNAME:+-e WAHA_DASHBOARD_USERNAME="${WAHA_DASHBOARD_USERNAME}"} \
        ${WAHA_DASHBOARD_PASSWORD:+-e WAHA_DASHBOARD_PASSWORD="${WAHA_DASHBOARD_PASSWORD}"} \
        ${WAHA_DASHBOARD_USERNAME:+-e WHATSAPP_SWAGGER_USERNAME="${WAHA_DASHBOARD_USERNAME}"} \
        ${WAHA_DASHBOARD_PASSWORD:+-e WHATSAPP_SWAGGER_PASSWORD="${WAHA_DASHBOARD_PASSWORD}"} \
        ${WAHA_SESSION:+-e WHATSAPP_START_SESSION="${WAHA_SESSION}"} \
        -e WHATSAPP_RESTART_ALL_SESSIONS=true \
        --restart unless-stopped \
        "$WAHA_IMAGE" >/dev/null 2>&1 || true
    fi
    echo -e "${GREEN}✓ WAHA started successfully on ${WAHA_LOCAL_API_URL:-http://localhost:${WAHA_PORT}}${NC}"
  fi

else
  echo -e "${YELLOW}⚠️  Docker daemon is not running. WAHA container could not be started.${NC}"
  echo -e "${YELLOW}   (Start Docker Desktop to enable local WhatsApp OTP delivery).${NC}"
fi


# ------------------------------------------------------------------------------
# 4. Android SMS Gateway — NOTE: requires Android phone with SMSGate app
# ------------------------------------------------------------------------------
# The ghcr.io/android-sms-gateway/server image requires a MySQL/MariaDB database
# and cannot run standalone against our Neon PostgreSQL cluster.
# SMS OTP delivery works differently: install the free "SMSGate" app on an Android
# phone, get credentials from the app Home screen, then set SMS_GATEWAY_URL,
# SMS_GATEWAY_USER, and SMS_GATEWAY_PASSWORD in apps/server/.env.
# The server then calls the phone's REST API directly — no Docker container needed.
echo -e "${YELLOW}📱 SMS Gateway: Install the SMSGate Android app and configure apps/server/.env${NC}"
echo -e "${YELLOW}   SMS_GATEWAY_URL=http://<phone-local-ip>:8080 (shown in the app)${NC}"

# Remove any stale/broken SMS gateway container left over from previous runs
if docker ps -a --format '{{.Names}}' 2>/dev/null | grep -q "^shopsmart-sms-gateway$"; then
  echo -e "${YELLOW}🗑️  Removing stale SMS gateway container (required MySQL, not PostgreSQL)...${NC}"
  docker rm -f shopsmart-sms-gateway >/dev/null 2>&1 || true
fi


# ------------------------------------------------------------------------------
# 5. Check & Setup Environment Files
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
# 6. Generate Prisma Client
# ------------------------------------------------------------------------------
echo -e "${BLUE}🔧 Generating Prisma client...${NC}"
pnpm --filter shopsmart-server db:generate

# ------------------------------------------------------------------------------

# 7. Display Service Dashboard Banner
# ------------------------------------------------------------------------------
echo ""
echo -e "${BOLD}${MAGENTA}======================================================================${NC}"
echo -e "${BOLD}${MAGENTA}                    🎉 ShopSmart Services Live                     ${NC}"
echo -e "${BOLD}${MAGENTA}======================================================================${NC}"
echo -e "  🛒 ${BOLD}Frontend App:${NC}         ${GREEN}${FRONTEND_LOCAL_URL:-http://localhost:${FRONTEND_PORT}}${NC}"
echo -e "  ⚙️  ${BOLD}Backend API:${NC}          ${GREEN}${BACKEND_LOCAL_URL:-http://localhost:${SERVER_PORT}}/api/v1/health${NC}"
echo -e "  💬 ${BOLD}WhatsApp (WAHA):${NC}      ${CYAN}${WAHA_LOCAL_API_URL:-http://localhost:${WAHA_PORT}}/dashboard${NC}"
if [ -n "$SMS_GATEWAY_URL" ]; then
  echo -e "  📱 ${BOLD}SMS Gateway URL:${NC}      ${CYAN}${SMS_GATEWAY_URL}${NC}"
fi
echo -e "  ⚡ ${BOLD}Redis Cache:${NC}          ${BLUE}localhost:${REDIS_PORT}${NC}"
echo -e "${BOLD}${MAGENTA}======================================================================${NC}"
echo ""

# ------------------------------------------------------------------------------
# 8. Trap Signals for Graceful Server Cleanup
# ------------------------------------------------------------------------------
cleanup() {
  echo ""
  echo -e "${YELLOW}🛑 Stopping ShopSmart development servers...${NC}"
  kill 0 2>/dev/null || true
  wait 2>/dev/null || true
  echo -e "${GREEN}✅ Development processes cleanly stopped.${NC}"
  exit 0
}

trap cleanup SIGINT SIGTERM EXIT

# ------------------------------------------------------------------------------
# 9. Start Backend & Frontend Concurrently
# ------------------------------------------------------------------------------
echo -e "${BOLD}${GREEN}🚀 Starting Next.js Frontend & Express Backend...${NC}"
echo ""

pnpm --filter shopsmart-server dev &
SERVER_PID=$!

pnpm --filter shopsmart-frontend dev &
CLIENT_PID=$!

wait $SERVER_PID $CLIENT_PID
