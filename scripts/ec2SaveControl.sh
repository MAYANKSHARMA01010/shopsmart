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


CURRENT_STATE=$(aws ec2 describe-instances \
  --instance-ids $INSTANCE_ID \
  --query "Reservations.Instances.State.Name" \
  --output text)

echo "[INFO] Current State: $CURRENT_STATE"

if [ "$1" == "start" ]; then
    if [ "$CURRENT_STATE" == "running" ]; then
        echo "[SKIP] Instance is already running."
    else
        echo "[INFO] Starting instance..."
        aws ec2 start-instances --instance-ids $INSTANCE_ID
    fi

elif [ "$1" == "stop" ]; then
    if [ "$CURRENT_STATE" == "stopped" ]; then
        echo "[SKIP] Instance is already stopped."
    else
        echo "[INFO] Stopping instance..."
        aws ec2 stop-instances --instance-ids $INSTANCE_ID
    fi

else
    echo "[ERROR] Usage: $0 {start|stop}"
fi