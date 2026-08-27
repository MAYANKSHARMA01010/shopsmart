#!/usr/bin/env bash

# ==============================================================================
# ShopSmart - Master GitHub Secrets Sync Utility
# Syncs all environment secrets from root .env to GitHub Actions Secrets.
# Requires: GitHub CLI (`gh auth login`)
# ==============================================================================

set -e

REPO="MAYANKSHARMA01010/shopsmart"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="$ROOT_DIR/.env"

if [ ! -f "$ENV_FILE" ]; then
    echo "❌ Error: .env file not found at $ENV_FILE"
    exit 1
fi

if ! command -v gh &> /dev/null; then
    echo "❌ Error: GitHub CLI ('gh') is not installed or not in PATH."
    echo "👉 Install with: brew install gh && gh auth login"
    exit 1
fi

echo "======================================================================"
echo "   🔄 Syncing ShopSmart Secrets to GitHub ($REPO)                     "
echo "======================================================================"

# Python helper to accurately extract single-line & multi-line values from .env
sync_secret() {
    local secret_name="$1"
    
    local secret_val
    secret_val=$(python3 -c "
import os, sys

def get_env_val(key, file_path):
    if not os.path.exists(file_path):
        return ''
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Simple multi-line dotenv parser
    lines = content.splitlines()
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        if not line or line.startswith('#'):
            i += 1
            continue
        if '=' in line:
            k, v = line.split('=', 1)
            k = k.strip()
            if k == key:
                v = v.strip()
                if v.startswith('\"') and not (v.endswith('\"') and len(v) > 1 and not v.endswith('\\\\\"')):
                    # Multi-line string
                    collected = [v[1:]]
                    i += 1
                    while i < len(lines):
                        cur = lines[i]
                        if cur.endswith('\"'):
                            collected.append(cur[:-1])
                            break
                        else:
                            collected.append(cur)
                        i += 1
                    return '\n'.join(collected)
                elif v.startswith('\"') and v.endswith('\"'):
                    return v[1:-1]
                elif v.startswith('\'') and v.endswith('\''):
                    return v[1:-1]
                else:
                    return v
        i += 1
    return ''

val = get_env_val('$secret_name', '$ENV_FILE')
if val:
    sys.stdout.write(val)
")

    if [ -n "$secret_val" ]; then
        echo "  -> 🔐 Syncing $secret_name..."
        echo "$secret_val" | gh secret set "$secret_name" --repo "$REPO"
    else
        echo "  -  ⚠️  Skipping $secret_name (empty or not defined in .env)"
    fi
}

# ------------------------------------------------------------------------------
# List of all standard secrets to sync
# ------------------------------------------------------------------------------
SECRETS_TO_SYNC=(
    # AWS Cloud Infrastructure
    "AWS_REGION"
    "AWS_ACCOUNT_ID"
    "AWS_ACCESS_KEY_ID"
    "AWS_SECRET_ACCESS_KEY"
    "AWS_SESSION_TOKEN"
    "AWS_EC2_INSTANCE_ID"
    "AWS_EC2_HOST"
    "AWS_EC2_USER"
    "AWS_EC2_KEY_NAME"
    "AWS_EC2_SECURITY_GROUP_ID"
    "AWS_EC2_SSH_KEY"
    "EC2_HOST"
    "EC2_USER"
    "EC2_SSH_KEY"

    # Database & Redis Connections
    "DATABASE_URL"
    "TEST_DATABASE_URL"
    "REDIS_LOCAL_URL"
    "REDIS_SERVER_URL"

    # Authentication & JWT
    "JWT_SECRET"
    "JWT_ACCESS_SECRET"
    "JWT_REFRESH_SECRET"

    # Razorpay Payment Gateway
    "RAZORPAY_KEY_ID"
    "RAZORPAY_KEY_SECRET"
    "RAZORPAY_WEBHOOK_SECRET"
    "NEXT_PUBLIC_RAZORPAY_KEY_ID"

    # Transactional Email (SMTP)
    "SMTP_HOST"
    "SMTP_PORT"
    "SMTP_USER"
    "SMTP_PASS"
    "SMTP_FROM"

    # Container Registry
    "DOCKERHUB_USERNAME"
    "DOCKERHUB_PASSWORD"
)

for secret in "${SECRETS_TO_SYNC[@]}"; do
    sync_secret "$secret"
done

echo ""
echo "======================================================================"
echo "   ✅ All Secrets Synchronized Successfully to GitHub ($REPO)!       "
echo "======================================================================"
