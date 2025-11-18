variable "user_pool_name" {
  type        = string
  description = "Name of the Cognito User Pool"
}

variable "app_client_name" {
  type        = string
  description = "Name of the Cognito User Pool App Client"
}

variable "domain_prefix" {
  type        = string
  description = "Unique domain prefix for the Cognito Hosted UI (must be unique per region)"
}

variable "callback_urls" {
  type        = list(string)
  description = "Allowed OAuth2 callback URLs"
}

variable "logout_urls" {
  type        = list(string)
  description = "Allowed logout URLs"
}

variable "supported_identity_providers" {
  type        = list(string)
  default     = ["COGNITO"]
  description = "Identity providers supported by this client"
}

variable "allowed_oauth_flows" {
  type    = list(string)
  default = ["code"] # Authorization code flow
}

variable "allowed_oauth_scopes" {
  type    = list(string)
  default = ["openid", "email", "profile"]
}

variable "tags" {
  type        = map(string)
  default     = {}
  description = "Tags to apply to all Cognito resources"
}