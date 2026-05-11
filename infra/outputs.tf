output "resource_group_name" {
  description = "Azure resource group for this environment."
  value       = azurerm_resource_group.main.name
}

output "container_registry_name" {
  description = "Azure Container Registry name."
  value       = azurerm_container_registry.main.name
}

output "container_registry_login_server" {
  description = "Azure Container Registry login server."
  value       = azurerm_container_registry.main.login_server
}

output "backend_image_repository" {
  description = "ACR repository that the GitHub Actions workflow pushes to."
  value       = "${azurerm_container_registry.main.login_server}/${var.backend_image_name}"
}

output "backend_container_app_name" {
  description = "Azure Container App name for the backend."
  value       = azurerm_container_app.backend.name
}

output "backend_url" {
  description = "Stable backend application URL."
  value       = "https://${azurerm_container_app.backend.ingress[0].fqdn}"
}

output "backend_health_url" {
  description = "Health endpoint exposed by Spring Boot Actuator."
  value       = "https://${azurerm_container_app.backend.ingress[0].fqdn}/actuator/health"
}

output "frontend_static_web_app_name" {
  description = "Azure Static Web App name."
  value       = azurerm_static_web_app.frontend.name
}

output "frontend_url" {
  description = "Frontend URL."
  value       = "https://${azurerm_static_web_app.frontend.default_host_name}"
}

output "database_host" {
  description = "PostgreSQL host name."
  value       = azurerm_postgresql_flexible_server.database.fqdn
}

output "database_name" {
  description = "Application database name."
  value       = azurerm_postgresql_flexible_server_database.app.name
}

output "database_connection_string_example" {
  description = "JDBC URL shape used by the backend. Password is supplied separately via secrets."
  value       = "jdbc:postgresql://${azurerm_postgresql_flexible_server.database.fqdn}:5432/${azurerm_postgresql_flexible_server_database.app.name}?sslmode=require"
}
