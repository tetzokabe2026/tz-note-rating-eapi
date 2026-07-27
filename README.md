# Evaluation Mock API

Mock Experience API that rates technical notes.  
The OpenAPI contract is the source of truth; local, Docker, and Google Cloud Run share the same behavior.

> 日本語: [README-JP.md](README-JP.md)

| | |
|---|---|
| **Version** | 1.0.0 |
| **OpenAPI** | [openapi.yaml](openapi.yaml) |
| **API Catalog (Swagger UI)** | https://tetzokabe2026.github.io/tz-note-rating-eapi/ |
| **Live API** | https://evaluation-mock-api-47730621722.asia-northeast1.run.app |
| **Specification** | [evaluation-mock-api-v1-project-specification.md](evaluation-mock-api-v1-project-specification.md) |

## API Catalog

This repository is published as an API catalog:

| Asset | Role |
|-------|------|
| [`openapi.yaml`](openapi.yaml) | Canonical API contract (OpenAPI 3.0.3) |
| [`docs/index.html`](docs/index.html) | Human-readable catalog UI (Swagger UI) |
| [`docs/openapi.yaml`](docs/openapi.yaml) | Spec copy served by GitHub Pages (keep in sync with root) |

**Catalog URL:** https://tetzokabe2026.github.io/tz-note-rating-eapi/

### What the catalog covers

- `POST /evaluations` — create an evaluation (random ratings 1–5)
- `GET /evaluations/{id}` — retrieve an evaluation
- `DELETE /evaluations/{id}` — delete an evaluation
- Request / response schemas, validation error shape, and Try it out servers (Local / Cloud Run)

### Evaluation response fields

| Field | Type | Range |
|-------|------|-------|
| `eval-id` | string | evaluation identifier |
| `usefulness` | integer | 1–5 |
| `importance` | integer | 1–5 |
| `credibility` | integer | 1–5 |

### Request body (`POST /evaluations`)

| Field | Type | Constraints |
|-------|------|-------------|
| `body` | string | required, length 20–255, no additional properties |

## Endpoints

| Method | Path | Success |
|--------|------|---------|
| `POST` | `/evaluations` | `201` + evaluation |
| `GET` | `/evaluations/{id}` | `200` + evaluation |
| `DELETE` | `/evaluations/{id}` | `204` |
| `GET` | `/health` | `200` `{"status":"ok"}` (ops only; not a business resource) |

Evaluations are stored **in memory** for the process lifetime. They are cleared on Cloud Run scale-in or cold start.

## Quick start (Live)

```bash
BASE_URL=https://evaluation-mock-api-47730621722.asia-northeast1.run.app

curl -s -X POST "$BASE_URL/evaluations" \
  -H 'Content-Type: application/json' \
  -d '{"body":"Cursor agents execute commands in an isolated environment."}'
```

Browse and try operations in the catalog UI:

https://tetzokabe2026.github.io/tz-note-rating-eapi/

## Local development

Requirements: Node.js 20+

```bash
npm install
npm test
npm start
```

Default port: `8080` (override with `PORT`)

```bash
curl -s -X POST http://localhost:8080/evaluations \
  -H 'Content-Type: application/json' \
  -d '{"body":"Cursor agents execute commands in an isolated environment."}'
```

## Docker

```bash
docker build -t evaluation-mock-api .
docker run --rm -p 8080:8080 evaluation-mock-api
```

## Deploy to Google Cloud Run

Prerequisites: authenticated `gcloud`, billing-enabled GCP project, and Cloud Run / Cloud Build / Artifact Registry APIs enabled.

### Option A — source deploy (recommended)

```bash
gcloud config set project <PROJECT_ID>
gcloud run deploy evaluation-mock-api \
  --source . \
  --region asia-northeast1 \
  --allow-unauthenticated \
  --memory 256Mi \
  --max-instances 3 \
  --port 8080
```

### Option B — Cloud Build + Artifact Registry

1. Create an Artifact Registry Docker repository named `evaluation-mock-api` in `asia-northeast1` (or change substitutions in `cloudbuild.yaml`).
2. Submit the build:

```bash
gcloud builds submit --config cloudbuild.yaml \
  --substitutions=SHORT_SHA=$(git rev-parse --short HEAD)
```

Deployed URL (project `http-sample-proj`, region `asia-northeast1`):

`https://evaluation-mock-api-47730621722.asia-northeast1.run.app`

### Smoke test

```bash
BASE_URL=https://evaluation-mock-api-47730621722.asia-northeast1.run.app

curl -s -X POST "$BASE_URL/evaluations" \
  -H 'Content-Type: application/json' \
  -d '{"body":"Cursor agents execute commands in an isolated environment."}'

# Use eval-id from the response:
curl -s "$BASE_URL/evaluations/<eval-id>"
curl -s -o /dev/null -w "%{http_code}\n" -X DELETE "$BASE_URL/evaluations/<eval-id>"
```

## GitHub Pages (API catalog hosting)

Configured for this repository:

- Branch: `master`
- Folder: `/docs`
- Public URL: https://tetzokabe2026.github.io/tz-note-rating-eapi/

When you update the OpenAPI contract, treat the root `openapi.yaml` as canonical and sync the Pages copy:

```bash
cp openapi.yaml docs/openapi.yaml
```

## Notes

- No authentication (Cloud Run `--allow-unauthenticated`)
- No database (data is ephemeral per instance)
- Git branch policy: `master` only
