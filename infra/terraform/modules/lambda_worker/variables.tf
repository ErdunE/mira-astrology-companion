variable "environment" {
  type = string
}
variable "name_prefix" {
  type = string
}

variable "function_name" {
  type = string
}
variable "runtime" {
  type = string
}
variable "handler" {
  type = string
}

variable "memory_size" {
  type    = number
  default = 256
}
variable "timeout" {
  type    = number
  default = 30
}
variable "environment_variables" {
  type    = map(string)
  default = {}
}

# Packaging: Use exactly one of (source_dir) or (s3_bucket + s3_key)
variable "source_dir" {
  type    = string
  default = null
}
variable "s3_bucket" {
  type    = string
  default = null
}
variable "s3_key" {
  type    = string
  default = null
}

# Optional VPC config
variable "subnet_ids" {
  type    = list(string)
  default = []
}
variable "security_group_ids" {
  type    = list(string)
  default = []
}

variable "log_retention_in_days" {
  type    = number
  default = 7
}
variable "tags" {
  type    = map(string)
  default = {}
}

# SQS trigger
variable "sqs_queue_arn" {
  type = string
}
variable "batch_size" {
  type    = number
  default = 10
}
variable "maximum_batching_window_in_seconds" {
  type    = number
  default = 5
}

variable "astrologer_api_secret_arn" {
  type = string
}

variable "dynamodb_conversations_arn" {
  type        = string
  description = "ARN of DynamoDB Conversations table"
}

