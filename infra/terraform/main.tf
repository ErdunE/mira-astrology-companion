data "aws_caller_identity" "current" {}

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
