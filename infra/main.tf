locals {
  environment_slug = lower(var.environment)
  base_name        = lower("${var.app_name}-${local.environment_slug}")
  unique_name      = lower("${local.base_name}-${var.name_suffix}")

  resource_group_name       = "${local.base_name}-rg"
  container_app_name        = "${local.base_name}-backend"
  container_app_env_name    = "${local.base_name}-cae"
  static_web_app_name       = "${local.unique_name}-swa"
  log_analytics_name        = "${local.unique_name}-logs"
  postgres_server_name      = "${local.unique_name}-psql"
  container_registry_name   = substr(replace("${var.app_name}${local.environment_slug}${var.name_suffix}acr", "-", ""), 0, 50)
  jdbc_connection_string    = "jdbc:postgresql://${azurerm_postgresql_flexible_server.database.fqdn}:5432/${azurerm_postgresql_flexible_server_database.app.name}?sslmode=require"
  frontend_url              = "https://${azurerm_static_web_app.frontend.default_host_name}"
  backend_url               = "https://${azurerm_container_app.backend.ingress[0].fqdn}"

  common_tags = merge(
    {
      application = var.app_name
      environment = var.environment
      managed_by  = "terraform"
      project     = "university-project"
    },
    var.tags
  )
}

resource "azurerm_resource_group" "main" {
  name     = local.resource_group_name
  location = var.location
  tags     = local.common_tags
}

resource "azurerm_log_analytics_workspace" "main" {
  name                = local.log_analytics_name
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  sku                 = "PerGB2018"
  retention_in_days   = 30
  tags                = local.common_tags
}

resource "azurerm_container_registry" "main" {
  name                = local.container_registry_name
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  sku                 = "Basic"
  admin_enabled       = true
  tags                = local.common_tags
}

resource "azurerm_container_app_environment" "main" {
  name                       = local.container_app_env_name
  location                   = azurerm_resource_group.main.location
  resource_group_name        = azurerm_resource_group.main.name
  log_analytics_workspace_id = azurerm_log_analytics_workspace.main.id
  tags                       = local.common_tags
}

resource "azurerm_postgresql_flexible_server" "database" {
  name                          = local.postgres_server_name
  location                      = var.postgres_location
  resource_group_name           = azurerm_resource_group.main.name
  administrator_login           = var.db_admin_username
  administrator_password        = var.db_admin_password
  version                       = var.db_version
  sku_name                      = var.db_sku_name
  storage_mb                    = var.db_storage_mb
  backup_retention_days         = 7
  auto_grow_enabled             = true
  public_network_access_enabled = true
  tags                          = local.common_tags

  lifecycle {
    ignore_changes = [
      zone,
      high_availability[0].standby_availability_zone
    ]
  }
}

resource "azurerm_postgresql_flexible_server_firewall_rule" "allow_azure_services" {
  count            = var.allow_azure_services ? 1 : 0
  name             = "allow-azure-services"
  server_id        = azurerm_postgresql_flexible_server.database.id
  start_ip_address = "0.0.0.0"
  end_ip_address   = "0.0.0.0"
}

resource "azurerm_postgresql_flexible_server_firewall_rule" "allow_developer_ip" {
  count            = trimspace(var.developer_ip_address) == "" ? 0 : 1
  name             = "allow-developer-ip"
  server_id        = azurerm_postgresql_flexible_server.database.id
  start_ip_address = trimspace(var.developer_ip_address)
  end_ip_address   = trimspace(var.developer_ip_address)
}

resource "azurerm_postgresql_flexible_server_database" "app" {
  name      = var.db_name
  server_id = azurerm_postgresql_flexible_server.database.id
  charset   = "utf8"
  collation = "en_US.utf8"

  depends_on = [
    azurerm_postgresql_flexible_server_firewall_rule.allow_azure_services
  ]
}

resource "azurerm_static_web_app" "frontend" {
  name                         = local.static_web_app_name
  resource_group_name          = azurerm_resource_group.main.name
  location                     = var.static_web_app_location
  sku_tier                     = "Free"
  sku_size                     = "Free"
  preview_environments_enabled = false
  tags                         = local.common_tags
}

resource "azurerm_container_app" "backend" {
  name                         = local.container_app_name
  container_app_environment_id = azurerm_container_app_environment.main.id
  resource_group_name          = azurerm_resource_group.main.name
  revision_mode                = "Single"
  tags                         = local.common_tags

  registry {
    server               = azurerm_container_registry.main.login_server
    username             = azurerm_container_registry.main.admin_username
    password_secret_name = "acr-password"
  }

  secret {
    name  = "acr-password"
    value = azurerm_container_registry.main.admin_password
  }

  secret {
    name  = "db-password"
    value = var.db_admin_password
  }

  secret {
    name  = "jwt-secret-key"
    value = var.jwt_secret
  }

  secret {
    name  = "ai-api-key"
    value = var.ai_api_key
  }

  secret {
    name  = "mail-password"
    value = var.mail_password
  }

  template {
    min_replicas = var.backend_min_replicas
    max_replicas = var.backend_max_replicas

    container {
      name   = "backend"
      image  = var.backend_bootstrap_image
      cpu    = var.backend_cpu
      memory = var.backend_memory

      env {
        name  = "SPRING_PROFILES_ACTIVE"
        value = "postgres"
      }

      env {
        name  = "DB_URL"
        value = local.jdbc_connection_string
      }

      env {
        name  = "DB_USERNAME"
        value = var.db_admin_username
      }

      env {
        name        = "DB_PASSWORD"
        secret_name = "db-password"
      }

      env {
        name        = "JWT_SECRET_KEY"
        secret_name = "jwt-secret-key"
      }

      env {
        name        = "AI_API_KEY"
        secret_name = "ai-api-key"
      }

      env {
        name  = "FRONTEND_URL"
        value = local.frontend_url
      }

      env {
        name  = "MAIL_USERNAME"
        value = var.mail_username
      }

      env {
        name        = "MAIL_PASSWORD"
        secret_name = "mail-password"
      }
    }
  }

  ingress {
    allow_insecure_connections = false
    external_enabled           = true
    target_port                = var.backend_port
    transport                  = "auto"

    traffic_weight {
      percentage      = 100
      latest_revision = true
    }
  }

  lifecycle {
    ignore_changes = [
      template[0].container[0].image
    ]
  }
}
