"""
User profile creation Lambda handler.
Handles POST /profile endpoint for creating/updating user profiles.
"""

import json
import logging
import os
import time
from typing import Any, Dict

import boto3
from botocore.exceptions import ClientError

# Import common utilities
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), ".."))  # noqa: E402

from common.api_wrapper import api_handler  # noqa: E402
from common.validators import validate_user_profile  # noqa: E402
from common.zodiac import calculate_zodiac_sign  # noqa: E402

# Setup logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# DynamoDB setup
dynamodb = boto3.resource("dynamodb")
TABLE_NAME = os.environ.get("USER_PROFILES_TABLE", "mira-user-profiles-dev")
table = dynamodb.Table(TABLE_NAME)


def extract_user_id_from_event(event: Dict[str, Any]) -> str:
    """
    Extract user_id from JWT claims in API Gateway event.

    Args:
        event: API Gateway event with JWT authorizer

    Returns:
        User ID (Cognito sub)

    Raises:
        ValueError: If user_id cannot be extracted
    """
    try:
        # Check if event is wrapped by api_handler
        if "raw_event" in event:
            event = event["raw_event"]

        # HTTP API v2.0 with JWT authorizer
        authorizer = event["requestContext"]["authorizer"]

        # HTTP API JWT authorizer format (has extra "jwt" layer)
        if "jwt" in authorizer:
            claims = authorizer["jwt"]["claims"]
        else:
            # Lambda authorizer format
            claims = authorizer["claims"]

        user_id = claims["sub"]
        logger.info(f"Extracted user_id: {user_id}")
        return user_id

    except (KeyError, TypeError) as e:
        logger.error(f"Failed to extract user_id from event: {e}")
        logger.error(f"Event structure: {json.dumps(event, default=str)}")
        raise ValueError("Unable to extract user identity from request")


def extract_email_from_event(event: Dict[str, Any]) -> str:
    """
    Extract email from JWT claims (optional).

    Args:
        event: API Gateway event with JWT authorizer

    Returns:
        Email address or empty string if not available
    """
    try:
        # Check if event is wrapped by api_handler
        if "raw_event" in event:
            event = event["raw_event"]

        authorizer = event["requestContext"]["authorizer"]

        if "jwt" in authorizer:
            claims = authorizer["jwt"]["claims"]
        else:
            claims = authorizer["claims"]

        return claims.get("email", "")
    except (KeyError, TypeError):
        return ""


@api_handler
def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Lambda handler for POST /profile endpoint.

    Expected request body:
    {
        "birth_date": "1990-01-15",
        "birth_time": "14:30",
        "birth_location": "New York, NY",
        "birth_country": "United States"
    }

    Success response (200):
    {
        "message": "Profile created successfully",
        "profile": {
            "user_id": "...",
            "birth_date": "1990-01-15",
            "zodiac_sign": "Capricorn",
            ...
        }
    }

    Error responses:
    - 400: Validation error
    - 500: Server error

    Args:
        event: API Gateway event
        context: Lambda context

    Returns:
        API Gateway response dict
    """
    logger.info("Profile creation request received")

    # Extract user_id from JWT
    try:
        user_id = extract_user_id_from_event(event)
        email = extract_email_from_event(event)
    except ValueError as e:
        return {
            "statusCode": 401,
            "body": json.dumps({"error": {"code": "UNAUTHORIZED", "message": str(e)}}),
        }

    # Parse request body
    try:
        # api_wrapper already parsed the body
        if "parsed_body" in event:
            body = event["parsed_body"]
        else:
            # Fallback for direct Lambda invocation
            body = json.loads(event.get("body", "{}"))

        logger.info(f"Request body: {body}")
    except json.JSONDecodeError:
        return {
            "statusCode": 400,
            "body": json.dumps(
                {
                    "error": {
                        "code": "INVALID_JSON",
                        "message": "Request body must be valid JSON",
                    }
                }
            ),
        }

    # Validate input
    try:
        validated_data = validate_user_profile(body)
        logger.info(f"Validation passed: {validated_data}")
    except ValueError as e:
        error_message = str(e)

        # Parse error message to extract field and reason
        # Format: "Validation failed for <field>: <reason>"
        if "Validation failed for" in error_message:
            parts = error_message.split(":", 1)
            field_part = parts[0].replace("Validation failed for", "").strip()
            reason = parts[1].strip() if len(parts) > 1 else "Invalid value"
        else:
            field_part = "unknown"
            reason = error_message

        logger.warning(f"Validation failed: {error_message}")

        return {
            "statusCode": 400,
            "body": json.dumps(
                {
                    "error": {
                        "code": "VALIDATION_ERROR",
                        "message": "Invalid input data",
                        "details": {"field": field_part, "reason": reason},
                    }
                }
            ),
        }

    # Calculate zodiac sign
    try:
        zodiac_sign = calculate_zodiac_sign(validated_data["birth_date"])
        logger.info(f"Calculated zodiac sign: {zodiac_sign}")
    except Exception as e:
        logger.error(f"Failed to calculate zodiac sign: {e}")
        zodiac_sign = "Unknown"

    # Prepare item for DynamoDB
    current_timestamp = int(time.time())

    profile_item = {
        "user_id": user_id,
        "birth_date": validated_data["birth_date"],
        "birth_time": validated_data["birth_time"],
        "birth_location": validated_data["birth_location"],
        "birth_country": validated_data["birth_country"],
        "zodiac_sign": zodiac_sign,
        "created_at": current_timestamp,
        "updated_at": current_timestamp,
        "chart_generated": False,
        "last_chart_generated_at": None,
    }

    # Add email if available
    if email:
        profile_item["email"] = email

    # Add timezone placeholder (will be calculated by Astrology API later)
    profile_item["timezone"] = None

    # Save to DynamoDB
    try:
        logger.info(f"Saving profile to DynamoDB table: {TABLE_NAME}")

        table.put_item(Item=profile_item)

        logger.info(f"Profile saved successfully for user: {user_id}")

    except ClientError as e:
        error_code = e.response["Error"]["Code"]
        error_message = e.response["Error"]["Message"]

        logger.error(f"DynamoDB error: {error_code} - {error_message}")

        return {
            "statusCode": 500,
            "body": json.dumps(
                {
                    "error": {
                        "code": "DATABASE_ERROR",
                        "message": "Failed to save profile",
                        "details": {"reason": error_message},
                    }
                }
            ),
        }

    except Exception as e:
        logger.error(f"Unexpected error saving to DynamoDB: {e}", exc_info=True)

        return {
            "statusCode": 500,
            "body": json.dumps(
                {
                    "error": {
                        "code": "INTERNAL_ERROR",
                        "message": "An unexpected error occurred",
                    }
                }
            ),
        }

    # Success response
    # Remove sensitive/internal fields from response
    response_profile = {
        "user_id": profile_item["user_id"],
        "birth_date": profile_item["birth_date"],
        "birth_time": profile_item["birth_time"],
        "birth_location": profile_item["birth_location"],
        "birth_country": profile_item["birth_country"],
        "zodiac_sign": profile_item["zodiac_sign"],
        "created_at": profile_item["created_at"],
    }

    if email:
        response_profile["email"] = email

    return {
        "statusCode": 200,
        "body": json.dumps(
            {"message": "Profile created successfully", "profile": response_profile}
        ),
    }


# Local testing
if __name__ == "__main__":
    print("Testing Profile Handler\n")
    print("=" * 70)

    # Mock context
    class MockContext:
        aws_request_id = "test-profile-creation"

    # Test 1: Valid profile creation
    print("\n[Test 1] Valid profile creation")
    print("-" * 70)

    test_event = {
        "httpMethod": "POST",
        "path": "/profile",
        "body": json.dumps(
            {
                "birth_date": "1990-01-15",
                "birth_time": "14:30",
                "birth_location": "New York, NY",
                "birth_country": "United States",
            }
        ),
        "requestContext": {
            "authorizer": {
                "claims": {"sub": "test-user-12345", "email": "test@example.com"}
            }
        },
    }

    result = lambda_handler(test_event, MockContext())
    print(f"Status Code: {result['statusCode']}")
    print(f"Response: {json.dumps(json.loads(result['body']), indent=2)}")

    # Test 2: Invalid date
    print("\n[Test 2] Invalid birth date")
    print("-" * 70)

    test_event_invalid = test_event.copy()
    test_event_invalid["body"] = json.dumps(
        {
            "birth_date": "2030-01-15",  # Future date
            "birth_time": "14:30",
            "birth_location": "New York, NY",
            "birth_country": "United States",
        }
    )

    result = lambda_handler(test_event_invalid, MockContext())
    print(f"Status Code: {result['statusCode']}")
    print(f"Response: {json.dumps(json.loads(result['body']), indent=2)}")

    print("\n" + "=" * 70)
    print("Local tests completed!")
