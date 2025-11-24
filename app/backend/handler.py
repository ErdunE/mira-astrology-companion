"""
Main Lambda handler entry point for API Gateway.
Routes requests to appropriate endpoint handlers.
"""

import json
import logging

from api.health_handler import lambda_handler as health_handler
from api.profile_handler import lambda_handler as profile_handler
from api.chat_handler import lambda_handler as chat_handler

# Setup logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)


def lambda_handler(event, context):
    """
    Main entry point - routes to specific handlers based on path.

    Supported routes:
    - GET  /health  -> Health check endpoint
    - POST /profile -> User profile creation endpoint
    - POST /chat    -> Chat conversation endpoint
    """
    # Handle warmup events from EventBridge keep-warm rule
    if event.get("source") == "mira.keep-warm":
        logger.info("Warmup event - establishing Bedrock connection")

        try:
            # Import here to avoid circular dependency
            from common.bedrock_client import BedrockClient

            # Initialize Bedrock client (establishes VPC endpoint connection)
            client = BedrockClient()

            # Make minimal Bedrock call to keep connection alive
            client.generate_response(
                user_profile={"zodiac_sign": "Aries", "birth_date": "2000-01-01", "birth_location": "Test"},
                chart_data={"data": {}, "aspects": []},
                user_question="warmup",
                max_tokens=10,
            )

            logger.info("Bedrock connection warmed successfully")
            return {"statusCode": 200, "body": json.dumps({"status": "warmed", "bedrock": "connected"})}

        except Exception as e:
            logger.warning(f"Warmup Bedrock test failed: {e}")
            # Still return success - warmup event should not fail
            return {"statusCode": 200, "body": json.dumps({"status": "warmed", "bedrock": "failed"})}

    # Get path and HTTP method from event (HTTP API v2.0 format)
    raw_path = event.get("rawPath", "")
    http_method = event.get("requestContext", {}).get("http", {}).get("method", "GET")

    # Route to appropriate handler
    if raw_path == "/health" or raw_path == "/default/health":
        return health_handler(event, context)

    elif raw_path == "/profile" or raw_path == "/default/profile":
        # Profile endpoint only accepts POST
        if http_method == "POST":
            return profile_handler(event, context)
        else:
            return {
                "statusCode": 405,
                "headers": {"Content-Type": "application/json", "Allow": "POST"},
                "body": '{"error": "Method not allowed", "message": "Only POST is supported for /profile"}',
            }

    elif raw_path == "/chat" or raw_path == "/default/chat":
        # Chat endpoint only accepts POST
        if http_method == "POST":
            return chat_handler(event, context)
        else:
            return {
                "statusCode": 405,
                "headers": {"Content-Type": "application/json", "Allow": "POST"},
                "body": '{"error": "Method not allowed", "message": "Only POST is supported for /chat"}',
            }

    # Default 404 response
    return {
        "statusCode": 404,
        "headers": {"Content-Type": "application/json"},
        "body": '{"error": "Not found", "path": "' + raw_path + '", "method": "' + http_method + '"}',
    }
