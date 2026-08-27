#!/usr/bin/env bash

# ==============================================================================
# ShopSmart - SSH Accessibility Verification Script
# ==============================================================================

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Safe .env loader
load_env() {
    local env_file="$1"
    if [ -f "$env_file" ]; then
        while IFS='=' read -r key val || [ -n "$key" ]; do
            [[ "$key" =~ ^[[:space:]]*# ]] && continue
            [[ -z "$key" ]] && continue
            key=$(echo "$key" | xargs)
            val=$(echo "$val" | sed -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//")
            if [[ "$key" =~ ^[a-zA-Z_][a-zA-Z0-9_]*$ ]]; then
                export "$key"="$val"
            fi
        done < <(grep -v '^#' "$env_file" | grep '=')
    fi
}

load_env "$ROOT_DIR/.env"

EC2_HOST="${AWS_EC2_HOST:-$EC2_HOST}"
EC2_USER="${AWS_EC2_USER:-${EC2_USER:-ubuntu}}"

if [ -z "$EC2_HOST" ]; then
    echo "❌ [ERROR] EC2_HOST or AWS_EC2_HOST is not set. Please check your .env file."
    exit 1
fi

echo "=> Checking if SSH (Port 22) is reachable at $EC2_HOST..."

if nc -zv -w 5 "$EC2_HOST" 22 2>&1 | grep -q 'succeeded'; then
    echo "✅ SSH port is OPEN! GitHub Actions and local SSH should be able to connect."
    echo "🔗 Connect manually with: ssh -i your-key.pem $EC2_USER@$EC2_HOST"
else
    echo "❌ SSH port is CLOSED or TIMED OUT."
    echo "   Troubleshooting steps:"
    echo "   1. Ensure your EC2 instance is 'running' (run: bash scripts/ec2Control.sh start)."
    echo "   2. Ensure the Security Group allows inbound traffic on Port 22 from 0.0.0.0/0."
    echo "   3. Double-check if your EC2 Public IP has changed (current: $EC2_HOST)."
fi
