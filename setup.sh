#!/bin/bash

export SF_ENVIRONMENT=dev
export SF_REGION=us-west-2

export SF_STAGE=foo
export AWS_REGION=$SF_REGION
export SF_SERVICE_NAME="foo-${SF_ENVIRONMENT}-serverless"
export SF_DEPLOY_BUCKET="foo-${SF_ENVIRONMENT}-${SF_REGION}-serverless-bucket"
export SF_DOWNLOAD_BUCKET="${SF_ENVIRONMENT}-downloads.yourdomain.com"

# auth0 arrays containing encrypted values
declare -A AUTH0_API_CLIENT_IDS
declare -A AUTH0_API_CLIENT_SECRETS

# auth0 DEV client IDs
AUTH0_API_CLIENT_IDS[dev]="KMS-encrypted-key"

# auth0 DEV client secrets
AUTH0_API_CLIENT_SECRETS[dev]="KMS-encrypted-key"

# Auth0
export SF_AUTH0_DOMAIN=yourdomain.auth0.com
export SF_AUTH0_CLIENT_NAME="foo-${SF_ENVIRONMENT}"
export SF_AUTH0_CLIENT_ID=${AUTH0_API_CLIENT_IDS[$SF_ENVIRONMENT]}
export SF_AUTH0_CLIENT_SECRET=${AUTH0_API_CLIENT_SECRETS[$SF_ENVIRONMENT]}

# Database
export SF_DB_NAME="foo_db"
export SF_DB_PASS="KMS-encrypted-key"
export SF_DB_USER="KMS-encrypted-key"
export SF_DB_HOST=$(aws rds describe-db-instances \
  --region $SF_REGION \
  --filters Name=db-instance-id,Values="foo-${SF_ENVIRONMENT}-${SF_REGION}" \
  --query 'DBInstances[].Endpoint.Address' \
  --output text)

VPC_ID=$(aws ec2 describe-vpcs \
  --region $SF_REGION \
  --filter Name=tag-value,Values="foo-${SF_ENVIRONMENT}" \
  --query 'Vpcs[].VpcId' \
  --output text)
export SF_SECURITY_GROUP=$(aws ec2 describe-security-groups \
  --region $SF_REGION \
  --filters Name=vpc-id,Values="${VPC_ID}" Name=tag-key,Values='Name' Name=tag-value,Values="foo-${SF_ENVIRONMENT}-app-sg" \
  --query 'SecurityGroups[].GroupId' \
  --output text)
export SF_SUBNET_ID_1=$(aws ec2 describe-subnets \
  --region $SF_REGION \
  --filters Name=vpc-id,Values="${VPC_ID}" Name=tag-key,Values='Name' Name=tag-value,Values="foo-${SF_ENVIRONMENT}-priv-sn1" \
  --query 'Subnets[].SubnetId' \
  --output text)
export SF_SUBNET_ID_2=$(aws ec2 describe-subnets \
  --region $SF_REGION \
  --filters Name=vpc-id,Values="${VPC_ID}" Name=tag-key,Values='Name' Name=tag-value,Values="foo-${SF_ENVIRONMENT}-priv-sn2" \
  --query 'Subnets[].SubnetId' \
  --output text)
export SF_ACCOUNT_ID=$(aws sts get-caller-identity \
  --query 'Account' \
  --output text)

# create a function that can use the exported values to return the API gateway service endpoint
get_api_gateway_url() {
 aws --region $SF_REGION cloudformation describe-stacks --stack-name ${SF_SERVICE_NAME}-${SF_STAGE} --query 'Stacks[0].Outputs[?OutputKey == `ServiceEndpoint`].OutputValue' --output text
 }
