#!/bin/bash

# Load environment variables from root .env
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
elif [ -f ../.env ]; then
    export $(grep -v '^#' ../.env | xargs)
fi

INSTANCE_ID=${INSTANCE_ID}

if [ -z "$INSTANCE_ID" ]; then
    echo "[ERROR] INSTANCE_ID is not set. Please check your .env file."
    exit 1
fi


STATE=$(aws ec2 describe-instances \
  --instance-ids $INSTANCE_ID \
  --query "Reservations.Instances.State.Name" \
  --output text)

SYSTEM_STATUS=$(aws ec2 describe-instance-status \
  --instance-ids $INSTANCE_ID \
  --query "InstanceStatuses.SystemStatus.Status" \
  --output text)

INSTANCE_STATUS=$(aws ec2 describe-instance-status \
  --instance-ids $INSTANCE_ID \
  --query "InstanceStatuses.InstanceStatus.Status" \
  --output text)

echo "Instance ID: $INSTANCE_ID"
echo "State:       $STATE"

if [ "$SYSTEM_STATUS" == "ok" ] && [ "$INSTANCE_STATUS" == "ok" ]; then
    echo "Health:      [OK]"
else
    echo "Health:      [ALERT]"
    echo "System:      $SYSTEM_STATUS"
    echo "Instance:    $INSTANCE_STATUS"
fi