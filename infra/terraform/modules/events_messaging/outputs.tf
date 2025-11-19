output "event_bus_name" {
  value = aws_cloudwatch_event_bus.mira_bus.name
}

output "main_queue_url" {
  value = aws_sqs_queue.events_main.id
}

output "main_queue_arn" {
  value = aws_sqs_queue.events_main.arn
}

output "dlq_url" {
  value = aws_sqs_queue.events_dlq.id
}

output "dlq_arn" {
  value = aws_sqs_queue.events_dlq.arn
}
