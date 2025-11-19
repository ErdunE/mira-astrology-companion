output "function_name" { value = local.fn_name }
output "function_arn" { value = local.fn_arn }

output "http_api_id" {
  value       = try(aws_apigatewayv2_api.http_api[0].id, null)
  description = "HTTP API ID (if created)"
}

output "invoke_url" {
  value       = try(aws_apigatewayv2_api.http_api[0].api_endpoint, null)
  description = "Base invoke URL for the HTTP API ($default stage)"
}