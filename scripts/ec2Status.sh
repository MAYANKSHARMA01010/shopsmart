#!/usr/bin/env bash

# ==============================================================================
# ShopSmart - EC2 Instance Status & Security Group Inspector
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
EC2_USER="${AWS_EC2_USER:-${EC2_USER:-ubuntu}}"

if [ -z "$INSTANCE_ID" ] || [ -z "$REGION" ]; then
    echo "❌ [ERROR] INSTANCE_ID or REGION is not set. Please check your .env file."
    exit 1
fi

echo "=> Checking status for $INSTANCE_ID in $REGION..."

STATUS=$(aws ec2 describe-instances \
  --region "$REGION" \
  --instance-ids "$INSTANCE_ID" \
  --query "Reservations[0].Instances[0].[State.Name,PublicIpAddress,SecurityGroups[0].GroupId]" \
  --output text 2>/dev/null || echo "unknown null null")

STATE=$(echo "$STATUS" | awk '{print $1}')
IP=$(echo "$STATUS" | awk '{print $2}')
SG_ID=$(echo "$STATUS" | awk '{print $3}')

echo "--------------------------------------"
echo "🆔 Instance ID : $INSTANCE_ID"
echo "🌍 Region      : $REGION"
echo "🚦 State       : $STATE"
echo "🌐 Public IP   : $IP"
echo "👤 User        : $EC2_USER"
echo "🛡️  Sec Group   : $SG_ID"
echo "--------------------------------------"

if [ "$STATE" != "running" ]; then
    echo "⚠️  ALERT: Instance is NOT running. Run 'bash scripts/ec2Control.sh start' first."
elif [ "$IP" == "null" ] || [ -z "$IP" ]; then
    echo "⚠️  ALERT: Instance does not have a Public IP assigned."
else
    echo "✅ Instance is running."
    echo "🔗 SSH Access: ssh -i your-key.pem $EC2_USER@$IP"
fi

if [ -n "$SG_ID" ] && [ "$SG_ID" != "null" ]; then
    echo ""
    echo "=> Checking Security Group Port 22 (SSH) rules..."
    aws ec2 describe-security-group-rules \
      --region "$REGION" \
      --filters "Name=group-id,Values=$SG_ID" \
      --query "SecurityGroupRules[?FromPort==\`22\`].[CidrIpv4,IpProtocol]" \
      --output table 2>/dev/null || true
fi
