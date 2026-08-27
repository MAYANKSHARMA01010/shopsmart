#!/usr/bin/env bash

# ==============================================================================
# ShopSmart - Safe State-Aware EC2 Control Utility
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

CURRENT_STATE=$(aws ec2 describe-instances \
  --region "$REGION" \
  --instance-ids "$INSTANCE_ID" \
  --query "Reservations[0].Instances[0].State.Name" \
  --output text 2>/dev/null || echo "unknown")

echo "[INFO] Current State for $INSTANCE_ID: $CURRENT_STATE"

if [ "$1" == "start" ]; then
    if [ "$CURRENT_STATE" == "running" ]; then
        echo "[SKIP] Instance is already running."
    else
        echo "[INFO] Starting instance $INSTANCE_ID..."
        aws ec2 start-instances --region "$REGION" --instance-ids "$INSTANCE_ID"
    fi
elif [ "$1" == "stop" ]; then
    if [ "$CURRENT_STATE" == "stopped" ]; then
        echo "[SKIP] Instance is already stopped."
    else
        echo "[INFO] Stopping instance $INSTANCE_ID..."
        aws ec2 stop-instances --region "$REGION" --instance-ids "$INSTANCE_ID"
    fi
else
    echo "❌ [ERROR] Usage: $0 {start|stop}"
    exit 1
fi