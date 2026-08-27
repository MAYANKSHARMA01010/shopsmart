#!/usr/bin/env bash

# ==============================================================================
# ShopSmart - EC2 Instance Start / Stop Control Utility
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

INSTANCE_ID="${AWS_EC2_INSTANCE_ID:-$INSTANCE_ID}"
REGION="${AWS_REGION:-${REGION:-us-east-1}}"

if [ -z "$INSTANCE_ID" ]; then
    echo "❌ [ERROR] INSTANCE_ID or AWS_EC2_INSTANCE_ID is not set. Please check your .env file."
    exit 1
fi

if [ "$1" == "start" ]; then
    echo "[INFO] Requesting Start for EC2 instance: $INSTANCE_ID (Region: $REGION)..."
    aws ec2 start-instances --region "$REGION" --instance-ids "$INSTANCE_ID"
elif [ "$1" == "stop" ]; then
    echo "[INFO] Requesting Stop for EC2 instance: $INSTANCE_ID (Region: $REGION)..."
    aws ec2 stop-instances --region "$REGION" --instance-ids "$INSTANCE_ID"
else
    echo "❌ [ERROR] Usage: $0 {start|stop}"
    exit 1
fi