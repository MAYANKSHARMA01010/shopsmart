#!/usr/bin/env bash

# ==============================================================================
# ShopSmart - EC2 Instance Health Check Utility
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

STATE=$(aws ec2 describe-instances \
  --region "$REGION" \
  --instance-ids "$INSTANCE_ID" \
  --query "Reservations[0].Instances[0].State.Name" \
  --output text 2>/dev/null || echo "unknown")

SYSTEM_STATUS=$(aws ec2 describe-instance-status \
  --region "$REGION" \
  --instance-ids "$INSTANCE_ID" \
  --query "InstanceStatuses[0].SystemStatus.Status" \
  --output text 2>/dev/null || echo "not-available")

INSTANCE_STATUS=$(aws ec2 describe-instance-status \
  --region "$REGION" \
  --instance-ids "$INSTANCE_ID" \
  --query "InstanceStatuses[0].InstanceStatus.Status" \
  --output text 2>/dev/null || echo "not-available")

echo "--------------------------------------"
echo "🆔 Instance ID : $INSTANCE_ID"
echo "🌍 Region      : $REGION"
echo "🚦 State       : $STATE"
echo "--------------------------------------"

if [ "$SYSTEM_STATUS" == "ok" ] && [ "$INSTANCE_STATUS" == "ok" ]; then
    echo "✅ Health      : [OK] (All 2/2 status checks passed)"
else
    echo "⚠️  Health      : [ALERT / INITIALIZING]"
    echo "   System Status   : $SYSTEM_STATUS"
    echo "   Instance Status : $INSTANCE_STATUS"
fi