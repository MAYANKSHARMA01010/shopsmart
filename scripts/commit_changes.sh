#!/usr/bin/env bash

# ==============================================================================
# ShopSmart - Granular Conventional Commit Script
# Stages and commits current changes atomically following conventional scopes:
# feat(...), docs(...), chore(...)
# ==============================================================================

set -e

# Colors for terminal output
BOLD="\033[1m"
GREEN="\033[0;32m"
BLUE="\033[0;34m"
YELLOW="\033[1;33m"
CYAN="\033[0;36m"
NC="\033[0m"

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo -e "${BOLD}${CYAN}======================================================================${NC}"
echo -e "${BOLD}${CYAN}            📦 ShopSmart Granular Conventional Commits                 ${NC}"
echo -e "${BOLD}${CYAN}======================================================================${NC}"

commit_step() {
  local step=$1
  local scope=$2
  local msg=$3

  echo -e "\n${BLUE}=> [Step $step] $scope: $msg${NC}"
  if git diff --cached --quiet; then
    echo -e "${YELLOW}   (No staged changes for this step, skipping...)${NC}"
  else
    git commit -m "$scope: $msg"
    echo -e "${GREEN}✓ Committed: $scope: $msg${NC}"
  fi
}

# ------------------------------------------------------------------------------
# 1. WhatsApp Service & Schema (Dual Local & Hosted URL Resolution)
# ------------------------------------------------------------------------------
echo -e "${CYAN}Staging WhatsApp service and schema...${NC}"
git add \
  apps/server/src/modules/sms/whatsapp.service.ts \
  apps/server/src/shared/config/env.ts
commit_step 1 "feat(whatsapp)" "implement dual local and hosted WAHA URL resolution"

# ------------------------------------------------------------------------------
# 2. Environment Templates Update
# ------------------------------------------------------------------------------
echo -e "${CYAN}Staging environment templates...${NC}"
git add \
  .env.example \
  apps/server/.env.example
commit_step 2 "docs(env)" "update WAHA configuration templates with local and hosted URLs"

# ------------------------------------------------------------------------------
# 3. Dev Runner & Build Metadata
# ------------------------------------------------------------------------------
echo -e "${CYAN}Staging dev.sh and build cache...${NC}"
git add \
  scripts/dev.sh \
  apps/client/tsconfig.tsbuildinfo 2>/dev/null || true
commit_step 3 "chore(dev)" "update dev.sh to reference WAHA_LOCAL_API_URL"

echo ""
echo -e "${BOLD}${GREEN}======================================================================${NC}"
echo -e "${BOLD}${GREEN}      ✅ All Granular Commits Completed Successfully!                ${NC}"
echo -e "${BOLD}${GREEN}======================================================================${NC}"
echo ""
echo -e "${BLUE}Current Git Log (Recent Commits):${NC}"
git log -n 5 --oneline --graph --decorate
echo ""
