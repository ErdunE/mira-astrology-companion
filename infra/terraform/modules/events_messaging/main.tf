#############################
# SQS Queues: Main + DLQ
#############################

# DLQ queue
resource "aws_sqs_queue" "events_dlq" {
  name = "mira-events-dlq-dev"

  # Maximum message retention time: 14 days (unit: seconds)
  message_retention_seconds = 1209600
}

# Main queue: Processes all events normally.
resource "aws_sqs_queue" "events_main" {
  name = "mira-events-queue-dev"

  # After a consumer retrieves a message, the message is "invisible" to other consumers for a period of time.
  # To avoid duplicate processing by multiple consumers
  visibility_timeout_seconds = 30

  # Messages are retained in the queue for a maximum of 4 days (in seconds).
  message_retention_seconds = 345600

  # Core elements: Configure retry + dead letter queue
  # If the same message is received more than maxReceiveCount, it will be sent to DLQ.
  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.events_dlq.arn
    maxReceiveCount     = 3
  })
}


#############################
# EventBridge: Bus + Rule + Target
#############################

# 1) Event Bus: Project-specific event bus
resource "aws_cloudwatch_event_bus" "mira_bus" {
  name = "mira-app-bus-dev"
}

# 2) Event Rule: Matches events with source = "mira.test".
resource "aws_cloudwatch_event_rule" "mira_test_rule" {
  name          = "mira-test-events-dev"
  description   = "Route test events from mira.test to SQS queue"
  event_bus_name = aws_cloudwatch_event_bus.mira_bus.name

  # Event matching rules (which can be expanded later based on business needs)
  event_pattern = jsonencode({
    "source" : ["mira.test"]
  })
}

# 3) Event Target: Sends events that meet the rules to the SQS main queue.
resource "aws_cloudwatch_event_target" "mira_sqs_target" {
  rule          = aws_cloudwatch_event_rule.mira_test_rule.name
  event_bus_name = aws_cloudwatch_event_rule.mira_test_rule.event_bus_name
  target_id     = "mira-events-queue-dev"
  arn           = aws_sqs_queue.events_main.arn
}


#############################
# SQS Queue Policy: Allow EventBridge
#############################

data "aws_iam_policy_document" "events_to_sqs" {
  statement {
    sid    = "AllowEventBridgeToSendMessages"
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["events.amazonaws.com"]
    }

    actions = [
      "sqs:SendMessage",
      "sqs:SendMessageBatch"
    ]

    resources = [
      aws_sqs_queue.events_main.arn
    ]

    # The restrictions can only be imposed from this specific Event Rule.
    condition {
      test     = "ArnEquals"
      variable = "aws:SourceArn"
      values = [
        aws_cloudwatch_event_rule.mira_test_rule.arn
      ]
    }
  }
}

resource "aws_sqs_queue_policy" "events_main_policy" {
  queue_url = aws_sqs_queue.events_main.id
  policy    = data.aws_iam_policy_document.events_to_sqs.json
}
