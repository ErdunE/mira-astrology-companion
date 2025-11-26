"""
API Lambda placeholder handler.
Replace this with actual endpoint logic.
"""

import json
import logging

logger = logging.getLogger()
logger.setLevel(logging.INFO)


def lambda_handler(event, context):
    logger.info(f"Received event: {json.dumps(event)}")

    return {
        "statusCode": 200,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
        },
        "body": json.dumps(
            {
                "message": "API Lambda placeholder",
                "requestId": context.request_id if context else "local-test",
            }
        ),
    }


if __name__ == "__main__":
    test_event = {"httpMethod": "GET", "path": "/health", "headers": {}, "body": None}

    class MockContext:
        request_id = "test-request-id"

    result = lambda_handler(test_event, MockContext())
    print(json.dumps(result, indent=2))
