# modules/s3_static/outputs.tf

output "frontend_bucket_name" {
  value       = aws_s3_bucket.frontend.bucket
  description = "Name of the frontend SPA bucket."
}

output "frontend_bucket_arn" {
  value       = aws_s3_bucket.frontend.arn
  description = "ARN of the frontend SPA bucket."
}

output "artifacts_bucket_name" {
  value       = aws_s3_bucket.artifacts.bucket
  description = "Name of the artifacts bucket."
}

output "artifacts_bucket_arn" {
  value       = aws_s3_bucket.artifacts.arn
  description = "ARN of the artifacts bucket."
}