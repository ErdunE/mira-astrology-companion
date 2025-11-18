data "aws_caller_identity" "current" {}

output "current_account_id" {
  value = data.aws_caller_identity.current.account_id
}

module "events_messaging" {
  source = "./modules/events_messaging"
}

output "events_event_bus_name" {
  value = module.events_messaging.event_bus_name
}

output "events_main_queue_url" {
  value = module.events_messaging.main_queue_url
}

output "events_dlq_queue_url" {
  value = module.events_messaging.dlq_url
}