output "function_name" { value = local.fn_name }
output "function_arn" { value = local.fn_arn }
output "event_source_mapping_uuid" { value = aws_lambda_event_source_mapping.sqs.uuid }