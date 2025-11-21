"""
Main Lambda handler entry point for API Gateway.
Routes requests to appropriate endpoint handlers.
"""

from api.health_handler import lambda_handler as health_handler
from api.profile_handler import lambda_handler as profile_handler


def lambda_handler(event, context):
    """
    Main entry point - routes to specific handlers based on path.

    Supported routes:
    - GET  /health  -> Health check endpoint
    - POST /profile -> User profile creation endpoint
    """
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

    # Default 404 response
    return {
        "statusCode": 404,
        "headers": {"Content-Type": "application/json"},
        "body": '{"error": "Not found", "path": "' + raw_path + '", "method": "' + http_method + '"}',
    }
