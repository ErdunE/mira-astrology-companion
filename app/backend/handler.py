"""
Main Lambda handler entry point for API Gateway.
Routes requests to appropriate endpoint handlers.
"""

from api.health_handler import lambda_handler as health_handler


def lambda_handler(event, context):
    """
    Main entry point - routes to specific handlers based on path.
    """
    # Get path from event (HTTP API v2.0 format)
    raw_path = event.get('rawPath', '')
    
    # Route to appropriate handler
    if raw_path == '/health' or raw_path == '/default/health':
        return health_handler(event, context)
    
    # Default 404 response
    return {
        'statusCode': 404,
        'headers': {'Content-Type': 'application/json'},
        'body': '{"error": "Not found", "path": "' + raw_path + '"}'
    }
