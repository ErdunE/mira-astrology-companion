# modules/s3_static/main.tf

data "aws_caller_identity" "current" {}

# -------------------------------------
# Frontend SPA bucket
# -------------------------------------
resource "aws_s3_bucket" "frontend" {
  bucket = var.frontend_bucket_name

  tags = merge(
    var.tags,
    {
      "Name"        = var.frontend_bucket_name
      "BucketScope" = "frontend-spa"
    }
  )
}

resource "aws_s3_bucket_versioning" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_public_access_block" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Enable static website hosting
resource "aws_s3_bucket_website_configuration" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "index.html"  # For SPA routing
  }
}

# Bucket policy to allow CloudFront/public access (if needed)
# Note: If using CloudFront, you'll want OAI/OAC instead
resource "aws_s3_bucket_policy" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "AllowCloudFrontOAI"
        Effect    = "Allow"
        Principal = {
          AWS = "arn:aws:iam::cloudfront:user/CloudFront Origin Access Identity ${var.cloudfront_oai_id}"
        }
        Action   = "s3:GetObject"
        Resource = "${aws_s3_bucket.frontend.arn}/*"
      }
    ]
  })
}

# -------------------------------------
# Artifacts bucket
# -------------------------------------

resource "aws_s3_bucket" "artifacts" {
  bucket = var.artifacts_bucket_name
  tags = merge(
    var.tags,
    {
      "Name"        = var.artifacts_bucket_name
      "BucketScope" = "artifacts"
    }
  )
}

resource "aws_s3_bucket_versioning" "artifacts" {
  bucket = aws_s3_bucket.artifacts.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_public_access_block" "artifacts" {
  bucket = aws_s3_bucket.artifacts.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Lifecycle rule for artifacts bucket:
# - keep current versions indefinitely
# - expire non-current versions after N days (for history size control)
resource "aws_s3_bucket_lifecycle_configuration" "artifacts" {
  bucket = aws_s3_bucket.artifacts.id

  dynamic "rule" {
    for_each = var.artifacts_lifecycle_enabled ? [1] : []
    content {
      id     = "artifacts-noncurrent-expiration"
      status = "Enabled"

      filter {
        prefix = ""
      }

      noncurrent_version_expiration {
        noncurrent_days = var.artifacts_lifecycle_expiration_days
      }
    }
  }
}