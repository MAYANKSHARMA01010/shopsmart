#!/bin/bash
# Script to verify EC2 instance status and Public IP

# Load environment variables from root .env
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
elif [ -f ../.env ]; then
    export $(grep -v '^#' ../.env | xargs)
fi

INSTANCE_ID=${INSTANCE_ID}
REGION=${REGION}

if [ -z "$INSTANCE_ID" ] || [ -z "$REGION" ]; then
    echo "[ERROR] INSTANCE_ID or REGION is not set. Please check your .env file."
    exit 1
fi


echo "=> Checking status for $INSTANCE_ID in $REGION..."

STATUS=$(aws ec2 describe-instances \
  --region $REGION \
  --instance-ids $INSTANCE_ID \
  --query "Reservations[0].Instances[0].[State.Name,PublicIpAddress,SecurityGroups[0].GroupId]" \
  --output text)

STATE=$(echo $STATUS | awk '{print $1}')
IP=$(echo $STATUS | awk '{print $2}')
SG_ID=$(echo $STATUS | awk '{print $3}')

echo "--------------------------------------"
echo "🆔 Instance ID : $INSTANCE_ID"
echo "🚦 State       : $STATE"
echo "🌍 Public IP   : $IP"
echo "🛡️ Sec Group   : $SG_ID"
echo "--------------------------------------"

if [ "$STATE" != "running" ]; then
    echo "❌ ALERT: Instance is NOT running. Run 'bash scripts/ec2Control.sh start' first."
elif [ "$IP" == "null" ]; then
    echo "❌ ALERT: Instance does not have a Public IP assigned."
else
    echo "✅ Instance is running. Verify that your GitHub 'EC2_HOST' secret is set to: $IP"
fi

echo "=> Verifying Security Group SSH rule..."
aws ec2 describe-security-group-rules \
  --region $REGION \
  --filters "Name=group-id,Values=$SG_ID" \
  --query "SecurityGroupRules[?FromPort=='22'].[CidrIpv4,IpProtocol]" \
  --output table
