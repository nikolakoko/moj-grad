variable "subscription_id" {
  description = "Azure subscription ID used by Terraform."
  type        = string
}

variable "app_name" {
  description = "Short application name used in Azure resource names."
  type        = string
}

variable "environment" {
  description = "Environment name. Use values such as dev or prod."
  type        = string
}

variable "location" {
  description = "Primary Azure region for the resource group, Container Apps, ACR, and Log Analytics."
  type        = string
}

variable "postgres_location" {
  description = "Azure region for PostgreSQL Flexible Server. Kept separate because some student subscriptions restrict PostgreSQL in West Europe."
  type        = string
  default     = "swedencentral"
}

variable "static_web_app_location" {
  description = "Azure region for Static Web Apps. Static Web Apps is only available in a small subset of Azure regions."
  type        = string
  default     = "westeurope"
}

variable "name_suffix" {
  description = "Extra suffix for globally unique resources like ACR, PostgreSQL, and Static Web Apps."
  type        = string
}

variable "backend_port" {
  description = "Port exposed by the Spring Boot backend container."
  type        = number
  default     = 8001
}

variable "backend_cpu" {
  description = "Backend Container App CPU allocation."
  type        = number
  default     = 0.5
}

variable "backend_memory" {
  description = "Backend Container App memory allocation."
  type        = string
  default     = "1Gi"
}

variable "backend_min_replicas" {
  description = "Minimum backend replicas. Set 0 to allow scale-to-zero and save credits."
  type        = number
  default     = 0
}

variable "backend_max_replicas" {
  description = "Maximum backend replicas."
  type        = number
  default     = 1
}

variable "backend_image_name" {
  description = "Repository name used inside Azure Container Registry for the backend image."
  type        = string
  default     = "backend"
}

variable "backend_bootstrap_image" {
  description = "Temporary public image used so Terraform can create the Container App before the first CI/CD deployment."
  type        = string
  default     = "mcr.microsoft.com/azuredocs/containerapps-helloworld:latest"
}

variable "db_name" {
  description = "Application database name."
  type        = string
}

variable "db_admin_username" {
  description = "PostgreSQL administrator username. This project uses it as the app database username for simplicity."
  type        = string
}

variable "db_admin_password" {
  description = "PostgreSQL administrator password."
  type        = string
  sensitive   = true
}

variable "db_version" {
  description = "PostgreSQL major version."
  type        = string
  default     = "16"
}

variable "db_sku_name" {
  description = "Flexible Server SKU. Burstable keeps cost down for a student project."
  type        = string
  default     = "B_Standard_B1ms"
}

variable "db_storage_mb" {
  description = "Database storage allocation in MB."
  type        = number
  default     = 32768
}

variable "allow_azure_services" {
  description = "When true, adds a firewall rule that allows Azure-hosted workloads to reach PostgreSQL. This is broader but simplest for Container Apps."
  type        = bool
  default     = true
}

variable "developer_ip_address" {
  description = "Optional public IPv4 address allowed to connect directly to PostgreSQL for local troubleshooting."
  type        = string
  default     = ""
}

variable "jwt_secret" {
  description = "JWT signing secret used by the backend."
  type        = string
  sensitive   = true
}

variable "ai_api_key" {
  description = "API key for the external AI service used by complaint classification."
  type        = string
  sensitive   = true
}

variable "mail_username" {
  description = "SMTP username for outbound mail."
  type        = string
}

variable "mail_password" {
  description = "SMTP application password for outbound mail."
  type        = string
  sensitive   = true
}

variable "tags" {
  description = "Optional tags applied to Azure resources."
  type        = map(string)
  default     = {}
}
