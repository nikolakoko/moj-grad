# MojGrad

MojGrad is a web application for submitting, classifying, and tracking citizen complaints. The repository contains a Spring Boot backend, a React frontend, and database migrations for the application data model.

## Deployment

Azure deployment files live under [infra/README.md](C:\Users\marko\OneDrive\Desktop\mojgrad\moj-grad\infra\README.md).

The chosen setup is intentionally simple:

- Spring Boot backend as a Docker image on Azure Container Apps
- React frontend on Azure Static Web Apps
- PostgreSQL on Azure Database for PostgreSQL Flexible Server
- GitHub Actions for dev and prod deployments
