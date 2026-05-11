Backend

backend/build.gradle.kts adds spring-boot-starter-actuator. This was only to expose a health endpoint for Azure; no business logic changed.
backend/src/main/resources/application.properties adds server.forward-headers-strategy=framework so Spring respects Azure proxy headers.
backend/src/main/resources/application.properties changes mail debug from hardcoded true to MAIL_DEBUG:false, so prod won’t always log SMTP chatter.
backend/src/main/resources/application.properties enables Actuator health and info, plus readiness/liveness probes.
backend/src/main/java/mk/ukim/finki/mojgrad/config/WebSecurityConfig.java injects app.frontend.url so CORS can use the deployed frontend URL instead of only localhost.
backend/src/main/java/mk/ukim/finki/mojgrad/config/WebSecurityConfig.java allows unauthenticated access to /actuator/health/**.
backend/src/main/java/mk/ukim/finki/mojgrad/config/WebSecurityConfig.java changes CORS from one hardcoded origin to FRONTEND_URL plus local dev http://localhost:5137.
backend/src/main/java/mk/ukim/finki/mojgrad/config/WebSecurityConfig.java adds allowed headers Mail-Token and Accept, and exposes Content-Disposition so cross-origin CSV downloads keep the filename.
___
Frontend

frontend/src/lib/apiClient.ts replaces the hardcoded /api assumption with VITE_API_BASE_URL || "/api".
frontend/src/lib/apiClient.ts adds buildApiUrl() so all callers can build API URLs consistently.
frontend/src/context/AuthContext.tsx now imports buildApiUrl, and login uses it instead of fetch("/api/auth/login").
frontend/src/pages/admin/RegisterPage.tsx now imports buildApiUrl, and registration submit uses it instead of fetch('/api/auth/register').
frontend/src/pages/dashboard/DocumentUploadPage.tsx now imports buildApiUrl, and CSV import upload uses it instead of fetch('/api/complaints/import').
frontend/src/pages/dashboard/DocumentGeneratePage.tsx now imports buildApiUrl, and CSV export uses it instead of fetch('/api/complaints/export').
Runtime/Support Files

frontend/public/staticwebapp.config.json was added so SPA routes fall back to index.html on Azure Static Web Apps.
frontend/.env.example was added with VITE_API_BASE_URL=http://localhost:8001/api.
backend/.env.example was updated to document SPRING_PROFILES_ACTIVE, default local FRONTEND_URL, and MAIL_DEBUG.
backend/Dockerfile and backend/.dockerignore were added for backend container deployment.
backend/.gitignore now ignores .gradle-home/, which was only for local verification cleanup.
What Did Not Change

No controller endpoints changed.
No service/business logic changed, including AI classification.
No database entities, migrations, or seed logic changed.
No frontend page behavior changed apart from how API URLs are resolved at runtime.
So the app-code changes were almost entirely deployment-facing: health checks, CORS, proxy handling, and making frontend API calls environment-aware.