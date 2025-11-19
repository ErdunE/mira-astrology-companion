output "security_group_id" {
  description = "Security group ID attached to the Bedrock interface endpoint"
  value       = aws_security_group.bedrock_vpce.id
}

output "vpc_endpoint_id" {
  description = "Bedrock runtime interface endpoint ID"
  value       = aws_vpc_endpoint.bedrock_runtime.id
}

output "vpc_endpoint_dns_entries" {
  description = "DNS entries for the interface endpoint"
  value       = aws_vpc_endpoint.bedrock_runtime.dns_entry
}