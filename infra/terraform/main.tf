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