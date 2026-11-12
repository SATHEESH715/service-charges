# ServiceCharges

A sample stripe: a .NET API with static data at `/api/charges` that also serves an Angular page, plus Bruno and Playwright tests.

| Folder | What it is | Tests |
|---|---|---|
| `api/` | .NET 10 minimal API (`/api/charges`, `/api/health`) | MSTest |
| `web/` | Angular page, built into the API | Vitest |
| `bruno/` | API tests | Bruno CLI |
| `playwright/` | UI tests | Playwright |

## Pipeline
`.github/workflows/ci.yml` runs on every push to `main`:
1. Runs the .NET and Angular unit tests.
2. Builds the app and starts it in the pipeline. If the repository variable `APP_SERVICE_NAME` is set, it deploys to that App Service and tests the deployed address instead.
3. Runs the Bruno and Playwright tests.
4. Writes one result file (`summary.json`) and publishes it, at the same time, to blob storage and to `result-repo`.

## Secrets and variables
Repository secrets: `AZURE_CLIENT_ID`, `AZURE_TENANT_ID`, `AZURE_SUBSCRIPTION_ID` and `RESULTS_REPO_TOKEN`.
Optional repository variables for an App Service deploy: `APP_SERVICE_NAME`, `APP_URL` and `RESOURCE_GROUP`.

## Run locally
```bash
cd api/SampleApi && dotnet run --urls http://127.0.0.1:5003
cd web && npm install && npm start
cd bruno && npm install && npm test
cd playwright && npm install && npx playwright install chromium && BASE_URL=http://127.0.0.1:4200 npm test
```
