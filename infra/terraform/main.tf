data "aws_caller_identity" "current" {}
data "aws_region" "current" {}

output "current_account_id" {
  value = data.aws_caller_identity.current.account_id
}
module "cognito_auth" {
  source = "./modules/cognito_auth"

  # placeholder (can change latter)
  user_pool_name  = "mira-user-pool-dev"
  app_client_name = "mira-web-client-dev"

  # Note: The domain_prefix must be globally unique within the Region.
  domain_prefix = "cs6620-team-chengdu-dev"

  # This is a placeholder URL; you can replace it with the actual frontend/API URL later.
  callback_urls = [
    "https://example.com/callback"
  ]

  logout_urls = [
    "https://example.com/logout"
  ]

  tags = {
    Project = "cs6620-final"
    Env     = "dev"
  }
}

output "cognito_user_pool_id" {
  value       = module.cognito_auth.user_pool_id
  description = "ID of the Cognito User Pool"
}

output "cognito_app_client_id" {
  value       = module.cognito_auth.app_client_id
  description = "ID of the Cognito App Client"
}

output "cognito_hosted_ui_base_url" {
  value       = module.cognito_auth.hosted_ui_base_url
  description = "Base URL of the Cognito Hosted UI"
}


module "events_messaging" {
  source = "./modules/events_messaging"
}

output "events_event_bus_name" {
  value = module.events_messaging.event_bus_name
}

output "events_main_queue_url" {
  value = module.events_messaging.main_queue_url
}

output "events_dlq_queue_url" {
  value = module.events_messaging.dlq_url
}


module "dynamodb_mira" {
  source = "./modules/dynamodb_mira"

  app_name = "mira"
  env      = "dev"

  tags = {
    Project = "cs6620-final"
    Env     = "dev"
  }
}

output "user_profiles_table_name" {
  description = "DynamoDB user profiles table name"
  value       = module.dynamodb_mira.user_profiles_table_name
}

output "conversations_table_name" {
  description = "DynamoDB conversations table name"
  value       = module.dynamodb_mira.conversations_table_name
}

output "user_profiles_table_arn" {
  description = "DynamoDB user profiles table ARN"
  value       = module.dynamodb_mira.user_profiles_table_arn
}

output "conversations_table_arn" {
  description = "DynamoDB conversations table ARN"
  value       = module.dynamodb_mira.conversations_table_arn
}


module "network_vpc" {
  source = "./modules/network_vpc"

  environment    = "dev"
  name_prefix    = "mira"
  vpc_cidr_block = "10.0.0.0/16"
  azs            = ["us-east-1a", "us-east-1b"]

  public_subnet_cidrs  = ["10.0.1.0/24", "10.0.2.0/24"]
  private_subnet_cidrs = ["10.0.11.0/24", "10.0.12.0/24"]

  tags = {
    Owner = "davie"
  }
}

output "vpc_id" {
  value = module.network_vpc.vpc_id
}


module "s3_static" {
  source = "./modules/s3_static"

  # Choose globally unique bucket names. A common pattern:
  # <project>-<env>-frontend
  # <project>-<env>-artifacts
  frontend_bucket_name  = "mira-dev-frontend-us-east-1"
  artifacts_bucket_name = "mira-dev-artifacts"

  tags = {
    Project = "cs6620-final"
    Env     = "dev"
  }

  # Optional: override lifecycle behavior if needed
  # artifacts_lifecycle_enabled          = true
  # artifacts_lifecycle_expiration_days  = 365
}

output "frontend_bucket_name" {
  value       = module.s3_static.frontend_bucket_name
  description = "Name of the frontend SPA S3 bucket."
}

output "artifacts_bucket_name" {
  value       = module.s3_static.artifacts_bucket_name
  description = "Name of the artifacts S3 bucket."
}


module "api_lambda" {
  source = "./modules/lambda_api"

  environment   = "dev"
  name_prefix   = "mira"
  function_name = "mira-api-dev"

  runtime = "python3.10"
  handler = "handler.lambda_handler"

  source_dir  = "${path.root}/lambda_src/api"
  memory_size = 256
  timeout     = 10

  environment_variables = {
    STAGE                        = "dev"
    DYNAMODB_PROFILES_TABLE      = module.dynamodb_mira.user_profiles_table_name
    DYNAMODB_CONVERSATIONS_TABLE = module.dynamodb_mira.conversations_table_name
    ASTROLOGY_SECRET_NAME        = "/mira/astrology/api_key"
  }

  astrologer_api_secret_arn = module.secrets_astrologer.astrologer_api_secret_arn

  dynamodb_userprofiles_arn = module.dynamodb_mira.user_profiles_table_arn
}


module "worker_lambda" {
  source = "./modules/lambda_worker"

  environment   = "dev"
  name_prefix   = "mira"
  function_name = "mira-worker-dev"
  runtime       = "python3.10"
  handler       = "handler.lambda_handler"
  source_dir    = "${path.root}/lambda_src/worker"
  memory_size   = 256
  timeout       = 30
  environment_variables = {
    STAGE                        = "dev"
    DYNAMODB_PROFILES_TABLE      = module.dynamodb_mira.user_profiles_table_name
    DYNAMODB_CONVERSATIONS_TABLE = module.dynamodb_mira.conversations_table_name

    ASTROLOGY_SECRET_NAME = "/mira/astrology/api_key"
  }

  # SQS trigger
  sqs_queue_arn = module.events_messaging.main_queue_arn
  batch_size    = 5

  astrologer_api_secret_arn = module.secrets_astrologer.astrologer_api_secret_arn

  # VPC Configuration: Using a private subnet + Bedrock VPC Endpoint SG
  subnet_ids         = module.network_vpc.private_subnet_ids
  security_group_ids = [module.bedrock_vpce.security_group_id]
}

output "worker_lambda_arn" {
  value       = module.worker_lambda.function_arn
  description = "Worker Lambda ARN"
}


module "bedrock_vpce" {
  source = "./modules/bedrock_vpce"

  environment        = "dev"
  name_prefix        = "mira"
  vpc_id             = module.network_vpc.vpc_id
  private_subnet_ids = module.network_vpc.private_subnet_ids
  vpc_cidr_block     = "10.0.0.0/16"

  # Optionally tighten to your Lambda SGs later:
  # allowed_security_group_ids = [aws_security_group.lambda.id]
  # or narrow CIDRs:
  # allowed_cidr_blocks = ["10.0.11.0/24", "10.0.12.0/24"]
}

output "bedrock_vpce_id" {
  value       = module.bedrock_vpce.vpc_endpoint_id
  description = "Bedrock runtime interface endpoint ID"
}

output "bedrock_vpce_sg_id" {
  value       = module.bedrock_vpce.security_group_id
  description = "Security group ID for the Bedrock interface endpoint"
}


module "secrets_astrologer" {
  source      = "./modules/secrets_astrologer"
  name_prefix = var.name_prefix
  environment = var.environment
  tags        = var.tags

  astrologer_api_key = var.astrologer_api_key
}


module "gateway_endpoints" {
  source = "./modules/gateway_endpoints"

  name_prefix             = var.name_prefix
  environment             = var.environment
  vpc_id                  = module.network_vpc.vpc_id
  private_route_table_ids = module.network_vpc.private_route_table_ids
  tags                    = var.tags
}


module "api_gateway" {
  source = "./modules/api_gateway"

  name_prefix = var.name_prefix
  environment = var.environment

  lambda_function_arn = module.api_lambda.function_arn

  cognito_user_pool_id  = module.cognito_auth.user_pool_id
  cognito_app_client_id = module.cognito_auth.app_client_id

  region = data.aws_region.current.name
  tags   = var.tags
}

output "http_api_endpoint" {
  value       = module.api_gateway.api_endpoint
  description = "HTTP API Gateway base endpoint"
}