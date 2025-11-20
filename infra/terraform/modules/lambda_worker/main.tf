locals {
  common_tags = merge({
    Environment = var.environment
    Project     = var.name_prefix
    ManagedBy   = "terraform"
  }, var.tags)
}

data "aws_region" "current" {}
data "aws_caller_identity" "current" {}

data "aws_iam_policy_document" "assume_lambda" {
  statement {
    effect = "Allow"
    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
    actions = ["sts:AssumeRole"]
  }
}

resource "aws_iam_role" "lambda_role" {
  name               = "${var.name_prefix}-${var.function_name}-role-${var.environment}"
  assume_role_policy = data.aws_iam_policy_document.assume_lambda.json
  tags               = local.common_tags
}

data "aws_iam_policy_document" "logs_basic" {
  statement {
    effect = "Allow"
    actions = [
      "logs:CreateLogGroup",
      "logs:CreateLogStream",
      "logs:PutLogEvents"
    ]
    resources = ["*"]
  }
}

# Allow Lambda to manage ENIs in VPC (required when using subnet_ids + security_group_ids)
resource "aws_iam_role_policy_attachment" "vpc_access" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
}

resource "aws_iam_role_policy" "logs_basic" {
  name   = "${var.name_prefix}-${var.function_name}-logs"
  role   = aws_iam_role.lambda_role.id
  policy = data.aws_iam_policy_document.logs_basic.json
}

data "aws_iam_policy_document" "sqs_read" {
  statement {
    effect = "Allow"
    actions = [
      "sqs:ReceiveMessage",
      "sqs:DeleteMessage",
      "sqs:GetQueueAttributes",
      "sqs:GetQueueUrl",
      "sqs:ChangeMessageVisibility"
    ]
    resources = [var.sqs_queue_arn]
  }
}

resource "aws_iam_role_policy" "sqs_read" {
  name   = "${var.name_prefix}-${var.function_name}-sqs"
  role   = aws_iam_role.lambda_role.id
  policy = data.aws_iam_policy_document.sqs_read.json
}

# ----- Secrets Manager permission for Astrologer API key -----

data "aws_iam_policy_document" "secrets_astrologer" {
  statement {
    effect = "Allow"

    actions = [
      "secretsmanager:GetSecretValue",
      "secretsmanager:DescribeSecret",
    ]

    resources = [
      var.astrologer_api_secret_arn
    ]
  }
}

resource "aws_iam_role_policy" "secrets_astrologer" {
  name   = "${var.name_prefix}-${var.function_name}-secrets"
  role   = aws_iam_role.lambda_role.id
  policy = data.aws_iam_policy_document.secrets_astrologer.json
}


# Package from source_dir
data "archive_file" "lambda_zip" {
  count       = var.source_dir != null ? 1 : 0
  type        = "zip"
  source_dir  = var.source_dir
  output_path = "${path.root}/.terraform/${var.function_name}.zip"
}

resource "aws_cloudwatch_log_group" "lambda" {
  name              = "/aws/lambda/${var.function_name}"
  retention_in_days = var.log_retention_in_days
  tags              = local.common_tags
}

resource "aws_lambda_function" "from_zip" {
  count            = var.source_dir != null ? 1 : 0
  function_name    = var.function_name
  runtime          = var.runtime
  handler          = var.handler
  filename         = data.archive_file.lambda_zip[0].output_path
  source_code_hash = data.archive_file.lambda_zip[0].output_base64sha256
  role             = aws_iam_role.lambda_role.arn
  memory_size      = var.memory_size
  timeout          = var.timeout
  environment { variables = var.environment_variables }

  dynamic "vpc_config" {
    for_each = length(var.subnet_ids) > 0 && length(var.security_group_ids) > 0 ? [1] : []
    content {
      subnet_ids         = var.subnet_ids
      security_group_ids = var.security_group_ids
    }
  }

  tags = local.common_tags
}

resource "aws_lambda_function" "from_s3" {
  count         = var.source_dir == null ? 1 : 0
  function_name = var.function_name
  runtime       = var.runtime
  handler       = var.handler
  s3_bucket     = var.s3_bucket
  s3_key        = var.s3_key
  role          = aws_iam_role.lambda_role.arn
  memory_size   = var.memory_size
  timeout       = var.timeout
  environment { variables = var.environment_variables }

  dynamic "vpc_config" {
    for_each = length(var.subnet_ids) > 0 && length(var.security_group_ids) > 0 ? [1] : []
    content {
      subnet_ids         = var.subnet_ids
      security_group_ids = var.security_group_ids
    }
  }

  tags = local.common_tags
}

locals {
  fn_arn  = try(aws_lambda_function.from_zip[0].arn, aws_lambda_function.from_s3[0].arn)
  fn_name = try(aws_lambda_function.from_zip[0].function_name, aws_lambda_function.from_s3[0].function_name)
}

resource "aws_lambda_permission" "allow_sqs" {
  statement_id  = "AllowSQSTrigger"
  action        = "lambda:InvokeFunction"
  function_name = local.fn_name
  principal     = "sqs.amazonaws.com"
  source_arn    = var.sqs_queue_arn
}

resource "aws_lambda_event_source_mapping" "sqs" {
  event_source_arn                   = var.sqs_queue_arn
  function_name                      = local.fn_arn
  batch_size                         = var.batch_size
  maximum_batching_window_in_seconds = var.maximum_batching_window_in_seconds
  enabled                            = true
}