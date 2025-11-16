# Backend Application

This folder contains all backend Lambda functions and shared modules.
The backend will be deployed using Terraform under the /infra directory.

Structure:
- api/: Lambda handlers for API Gateway routes
- worker/: Async worker Lambda triggered by SQS
- common/: Shared utilities (auth, db, helpers)

Code will be implemented as tickets progress.
