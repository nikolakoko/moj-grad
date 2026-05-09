# Azure Deployment

## Chosen architecture

This project uses a mixed deployment model:

- Backend: Docker image deployed to Azure Container Apps
- Frontend: React static build deployed to Azure Static Web Apps
- Database: Azure Database for PostgreSQL Flexible Server
- Images: Azure Container Registry
- Logs: Log Analytics attached to the Container Apps environment

This is the simplest production-like setup for the current repo because:

- The backend is Spring Boot on Java 21, which is cleaner to ship as a container than as a custom VM or more expensive platform service.
- The frontend is a Vite SPA, so hosting static files separately is cheaper and simpler than containerizing the frontend too.
- Azure Static Web Apps gives you HTTPS and proper SPA route fallback without adding Front Door, App Service, or another reverse proxy.
- PostgreSQL already matches the backend profile split and Flyway migration setup.

## Deployment decision

Only the backend is containerized.

- Docker is a good fit for the Java backend because it standardizes the runtime and keeps Azure deployment simple.
- The frontend is not containerized because it builds to static files and is cheaper to host as a static site.

## Resource overview

Per environment (`dev` or `prod`), Terraform creates:

- 1 resource group
- 1 Azure Container Registry (`Basic`)
- 1 Log Analytics workspace
- 1 Azure Container Apps environment
- 1 Azure Container App for the backend
- 1 Azure Static Web App for the frontend
- 1 Azure Database for PostgreSQL Flexible Server (`B_Standard_B1ms`)
- 1 PostgreSQL database inside that server
- Firewall rules for Azure-hosted access, plus an optional rule for your own public IP

## Cost notes

These defaults are chosen to stay friendly to a student Azure credit budget:

- PostgreSQL uses the Burstable `B_Standard_B1ms` SKU.
- ACR uses the `Basic` tier.
- Static Web Apps uses the `Free` tier.
- Dev backend scales to zero by default.
- Prod defaults to a single replica for better responsiveness, but you can set `backend_min_replicas = 0` there too if you want the lowest cost.

## Repo-specific notes

- Backend framework: Spring Boot 3.4 on Gradle
- Frontend package manager: npm (`package-lock.json` is present)
- Backend health endpoint: `/actuator/health`
- Flyway migrations: `backend/src/main/resources/db/migration`
- Initial data seeding: `backend/src/main/java/mk/ukim/finki/mojgrad/config/DataInitializer.java`
- Frontend SPA routing: handled by `frontend/public/staticwebapp.config.json`
- Backend mail links and CORS both depend on the deployed frontend URL
- Frontend API base URL is injected at build time through `VITE_API_BASE_URL`

## Terraform commands

Run from [infra](C:\Users\marko\OneDrive\Desktop\mojgrad\moj-grad\infra):

```bash
terraform init
terraform plan -var-file="dev.tfvars"
terraform apply -var-file="dev.tfvars"
```

For production:

```bash
terraform plan -var-file="prod.tfvars"
terraform apply -var-file="prod.tfvars"
```

## Required Terraform inputs

Update these values in `dev.tfvars` and `prod.tfvars` before you apply:

- `subscription_id`
- `name_suffix`
- `db_admin_password`
- `jwt_secret`
- `ai_api_key`
- `mail_username`
- `mail_password`
- `developer_ip_address` if you want direct local database access

## GitHub Actions setup

Create two GitHub environments:

- `dev`
- `prod`

Add this secret to each environment:

- `AZURE_CREDENTIALS`

`AZURE_CREDENTIALS` should contain a JSON service principal credential that can:

- push to ACR
- update Container Apps
- read Static Web App deployment tokens

Recommended GitHub environment variables:

- `APP_NAME`
- `NAME_SUFFIX`
- `AZURE_LOCATION`
- `BACKEND_IMAGE_NAME`

If you do not set them, the workflows fall back to the same defaults used in the sample tfvars files.

For safer production deploys, configure required reviewers on the GitHub `prod` environment. The `deploy-prod.yml` workflow is wired to use that environment.

## CI/CD flow

`dev` branch:

- runs backend tests
- runs frontend tests with `--passWithNoTests`
- builds the backend Docker image
- pushes the image to ACR
- updates the backend Container App
- builds the frontend with the deployed backend URL
- deploys the built SPA to Azure Static Web Apps

`main` branch:

- same deployment flow
- uses the `prod` GitHub environment for approval/secrets separation

## Environment variables used by the app

Backend runtime variables:

- `SPRING_PROFILES_ACTIVE=postgres`
- `DB_URL`
- `DB_USERNAME`
- `DB_PASSWORD`
- `JWT_SECRET_KEY`
- `AI_API_KEY`
- `FRONTEND_URL`
- `MAIL_USERNAME`
- `MAIL_PASSWORD`

Frontend build-time variable:

- `VITE_API_BASE_URL`

## Dev vs prod defaults

- Resource group names follow `<app-name>-<env>-rg`
- Dev backend scales to zero by default
- Prod keeps one backend replica by default
- Both environments use separate Static Web Apps, PostgreSQL servers, Container Apps, and ACR instances

## Destroying infrastructure

Destroy dev:

```bash
terraform destroy -var-file="dev.tfvars"
```

Destroy prod:

```bash
terraform destroy -var-file="prod.tfvars"
```

## Troubleshooting

- If Terraform says a globally unique name is unavailable, change `name_suffix`.
- If the backend cannot connect to PostgreSQL, verify the `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, and the firewall rules.
- If the frontend loads but API calls fail, verify that the workflow built it with the correct `VITE_API_BASE_URL`.
- If invite/register links fail, verify `FRONTEND_URL` in the Container App environment.
- If CSV export downloads but loses the filename, redeploy the backend with the updated CORS config that exposes `Content-Disposition`.
- If GitHub Actions cannot deploy the SPA, verify the Azure login secret and that the workflow can call `az staticwebapp secrets list`.
- If the backend is slow after inactivity, that is expected when `backend_min_replicas = 0`; raise it to `1` if you want fewer cold starts.
- If PostgreSQL CPU credits run low on `B_Standard_B1ms`, move to a larger Burstable SKU such as `B_Standard_B2s`.

## Assumptions

- Separate dev and prod environments are preferred over shared infrastructure.
- Public-access PostgreSQL with Azure firewall rules is acceptable for this university project in exchange for simpler setup.
- The first Terraform apply creates the backend Container App with a placeholder image. The first GitHub Actions deployment replaces it with the real application image.
