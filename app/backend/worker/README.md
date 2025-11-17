# Worker Lambda Handlers

This directory contains Lambda functions for background jobs triggered by SQS.

## Current Handlers

- `handler.py` - Placeholder for async task processing

## Usage

Worker Lambdas are triggered by SQS messages and process tasks like:
- Cleaning up expired charts
- Generating analytics
- Sending notifications

Each handler processes SQS event records in batch.