subscription_id     = "00000000-0000-0000-0000-000000000000"
app_name            = "mojgrad"
environment         = "dev"
location            = "westeurope"
name_suffix         = "student01"
backend_image_name  = "backend"
backend_min_replicas = 0
backend_max_replicas = 1

db_name           = "mojgrad"
db_admin_username = "mojgradadmin"
db_admin_password = "replace-me-with-a-strong-password"

developer_ip_address = ""

jwt_secret    = "replace-me-with-a-long-random-jwt-secret"
ai_api_key    = "replace-me-with-your-ai-provider-key"
mail_username = "replace-me@example.com"
mail_password = "replace-me-with-your-mail-app-password"

tags = {
  environment = "dev"
  project     = "mojgrad"
}
