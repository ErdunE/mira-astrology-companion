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

module "s3_static" {
  source = "./modules/s3_static"

  # Choose globally unique bucket names. A common pattern:
  # <project>-<env>-frontend
  # <project>-<env>-artifacts
  frontend_bucket_name  = "mira-dev-frontend"
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