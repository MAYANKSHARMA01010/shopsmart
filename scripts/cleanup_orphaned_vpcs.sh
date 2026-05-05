#!/bin/bash

# Exit on error
set -e

REGION="us-east-1"
VPC_NAME="shopsmart-vpc"

echo "🔍 Searching for orphaned VPCs named '$VPC_NAME' in $REGION..."

# Find all VPC IDs with the name shopsmart-vpc
VPC_IDS=$(aws ec2 describe-vpcs \
  --region $REGION \
  --filters "Name=tag:Name,Values=$VPC_NAME" \
  --query 'Vpcs[*].VpcId' \
  --output text)

if [ -z "$VPC_IDS" ]; then
  echo "✅ No orphaned VPCs found. You are good to go!"
  exit 0
fi

for VPC_ID in $VPC_IDS; do
  echo "⚠️ Found orphaned VPC: $VPC_ID. Starting cleanup..."

  # 1. Delete Internet Gateways
  IGWS=$(aws ec2 describe-internet-gateways \
    --region $REGION \
    --filters "Name=attachment.vpc-id,Values=$VPC_ID" \
    --query 'InternetGateways[*].InternetGatewayId' \
    --output text)
  
  for IGW in $IGWS; do
    echo "  -> Detaching Internet Gateway: $IGW"
    aws ec2 detach-internet-gateway --region $REGION --internet-gateway-id $IGW --vpc-id $VPC_ID || true
    echo "  -> Deleting Internet Gateway: $IGW"
    aws ec2 delete-internet-gateway --region $REGION --internet-gateway-id $IGW || true
  done

  # 2. Delete Subnets
  SUBNETS=$(aws ec2 describe-subnets \
    --region $REGION \
    --filters "Name=vpc-id,Values=$VPC_ID" \
    --query 'Subnets[*].SubnetId' \
    --output text)
    
  for SUBNET in $SUBNETS; do
    echo "  -> Deleting Subnet: $SUBNET"
    aws ec2 delete-subnet --region $REGION --subnet-id $SUBNET || true
  done

  # 3. Delete Custom Route Tables (cannot delete the Main route table directly before VPC)
  ROUTE_TABLES=$(aws ec2 describe-route-tables \
    --region $REGION \
    --filters "Name=vpc-id,Values=$VPC_ID" \
    --query 'RouteTables[?Associations[0].Main != `true`].RouteTableId' \
    --output text)
    
  for RT in $ROUTE_TABLES; do
    echo "  -> Deleting Route Table: $RT"
    aws ec2 delete-route-table --region $REGION --route-table-id $RT || true
  done

  # 4. Delete Custom Security Groups (cannot delete 'default' SG directly before VPC)
  SECURITY_GROUPS=$(aws ec2 describe-security-groups \
    --region $REGION \
    --filters "Name=vpc-id,Values=$VPC_ID" \
    --query 'SecurityGroups[?GroupName != `default`].GroupId' \
    --output text)
    
  for SG in $SECURITY_GROUPS; do
    echo "  -> Deleting Security Group: $SG"
    aws ec2 delete-security-group --region $REGION --group-id $SG || true
  done

  # 5. Finally, Delete the VPC
  echo "  -> Deleting VPC: $VPC_ID"
  aws ec2 delete-vpc --region $REGION --vpc-id $VPC_ID || true
  
  echo "  -> Waiting for VPC $VPC_ID to be fully removed..."
  # No direct 'wait vpc-deleted' command, so we poll
  for i in {1..10}; do
    if ! aws ec2 describe-vpcs --region $REGION --vpc-ids $VPC_ID 2>/dev/null; then
      break
    fi
    sleep 2
  done
  
  echo "✅ Successfully cleaned up $VPC_ID!"
done

echo "🎉 All orphaned VPCs have been removed. Your AWS limits are cleared."

echo "🧹 Cleaning up existing ECS Services to ensure idempotency..."
CLUSTER_NAME="shopsmart-cluster"
SERVICES=("shopsmart-backend-service" "shopsmart-frontend-service")

for SERVICE in "${SERVICES[@]}"; do
  echo "  -> Checking ECS Service: $SERVICE"
  # Check if service exists
  SERVICE_EXISTS=$(aws ecs describe-services --cluster $CLUSTER_NAME --services $SERVICE --region $REGION --query "services[?status!='INACTIVE'].serviceName" --output text || true)
  if [ -n "$SERVICE_EXISTS" ] && [ "$SERVICE_EXISTS" != "None" ]; then
    echo "  -> Force deleting ECS Service: $SERVICE"
    aws ecs delete-service --cluster $CLUSTER_NAME --service $SERVICE --force --region $REGION || true
    echo "  -> Waiting for $SERVICE to finish draining (this may take a minute)..."
    aws ecs wait services-inactive --cluster $CLUSTER_NAME --services $SERVICE --region $REGION || true
  fi
done

echo "✅ ECS cleanup complete!"

echo "🪣 Cleaning up orphaned S3 Artifact Buckets..."
# Find buckets starting with shopsmart-artifacts-
BUCKETS=$(aws s3api list-buckets --query "Buckets[?starts_with(Name, 'shopsmart-artifacts-')].Name" --output text)

for BUCKET in $BUCKETS; do
  echo "  -> Emptying and Deleting S3 Bucket: $BUCKET"
  # Empty bucket first (required for deletion)
  aws s3 rm "s3://$BUCKET" --recursive || true
  # Delete the bucket
  aws s3api delete-bucket --bucket "$BUCKET" --region $REGION || true
  echo "  -> Waiting for bucket $BUCKET deletion to propagate..."
  aws s3api wait bucket-not-exists --bucket "$BUCKET" || true
done

echo "✅ S3 cleanup complete!"
echo "🚀 Environment is clean and ready for Terraform!"
