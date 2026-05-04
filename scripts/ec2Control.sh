# Load environment variables from root .env if it exists
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
elif [ -f ../.env ]; then
    export $(grep -v '^#' ../.env | xargs)
fi

# Use environment variable or fallback to hardcoded (if you prefer)
INSTANCE_ID=${INSTANCE_ID}

if [ -z "$INSTANCE_ID" ]; then
    echo "[ERROR] INSTANCE_ID is not set. Please check your .env file."
    exit 1
fi


if [ "$1" == "start" ]; then
    echo "[INFO] Requesting Start for $INSTANCE_ID..."
    aws ec2 start-instances --instance-ids $INSTANCE_ID

elif [ "$1" == "stop" ]; then
    echo "[INFO] Requesting Stop for $INSTANCE_ID..."
    aws ec2 stop-instances --instance-ids $INSTANCE_ID

else
    echo "[ERROR] Usage: $0 {start|stop}"
fi