# Evaluation Mock API

Mock Experience API that rates technical notes.  
The OpenAPI contract is the source of truth.

> 日本語: [README-JP.md](README-JP.md)

| | |
|---|---|
| **Version** | [`openapi.yaml`](openapi.yaml) → `info.version` |
| **OpenAPI** | [openapi.yaml](openapi.yaml) |
| **API Catalog (Swagger UI)** | https://tetzokabe2026.github.io/tz-note-rating-eapi/ |
| **Prism MOCK (use for app testing)** | https://evaluation-oas-prism-i7pbbhm3ja-an.a.run.app |
| **Production (Cloud Run) — do not use for testing** | https://evaluation-mock-api-47730621722.asia-northeast1.run.app |
| **Specification** | [evaluation-mock-api-v1-project-specification.md](evaluation-mock-api-v1-project-specification.md) |

## WARNING: Use Prism MOCK — not Production

**Cloud Run is Production.** Do **not** call Production from application development or integration tests.

| Environment | URL | App testing |
|-------------|-----|-------------|
| **Prism MOCK** | https://evaluation-oas-prism-i7pbbhm3ja-an.a.run.app | **Required** |
| **Cloud Run Production** | https://evaluation-mock-api-47730621722.asia-northeast1.run.app | **Forbidden** |

## API Catalog

| Asset | Role |
|-------|------|
| [`openapi.yaml`](openapi.yaml) | Canonical API contract (OpenAPI 3.0.3) |
| [`docs/index.html`](docs/index.html) | Human-readable catalog UI (Swagger UI) |
| [`docs/openapi.yaml`](docs/openapi.yaml) | Spec copy served by GitHub Pages (keep in sync with root) |

**Catalog URL:** https://tetzokabe2026.github.io/tz-note-rating-eapi/

### Evaluation response fields

| Field | Type | Range |
|-------|------|-------|
| `eval-id` | string | evaluation identifier |
| `usefulness` | integer | 1–5 |
| `importance` | integer | 1–5 |
| `credibility` | integer | 1–5 |
| `personable` | integer | 1–5 |

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
| `GET` | `/version` | `200` + `{"version":"<info.version>"}` |
| `GET` | `/health` | `200` `{"status":"ok"}` (ops only; not a business resource) |

Evaluations on Production are stored **in memory** for the process lifetime and are cleared on scale-in or cold start.

## Quick start (Prism MOCK)

```bash
BASE_URL=https://evaluation-oas-prism-i7pbbhm3ja-an.a.run.app

curl -s -X POST "$BASE_URL/evaluations" \
  -H 'Content-Type: application/json' \
  -d '{"body":"Cursor agents execute commands in an isolated environment."}'
```

Browse the catalog UI: https://tetzokabe2026.github.io/tz-note-rating-eapi/

## Local development (implementers only)

Requirements: Node.js 20+

```bash
npm install
npm test
npm start
```

Default port: `8080` (override with `PORT`). Local servers are not listed in the API catalog.

## Docker

```bash
docker build -t evaluation-mock-api .
docker run --rm -p 8080:8080 evaluation-mock-api
```

## Deploy to Google Cloud Run (Production)

Prerequisites: authenticated `gcloud`, billing-enabled GCP project, and Cloud Run / Cloud Build / Artifact Registry APIs enabled.

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

Production URL (Cloud Run):

`https://evaluation-mock-api-47730621722.asia-northeast1.run.app`

## Version (single source)

Edit **`info.version` in [`openapi.yaml`](openapi.yaml) only.** Everything else derives from it:

| Consumer | How |
|----------|-----|
| Express `GET /version` | Reads `openapi.yaml` at startup ([`src/openapi-version.js`](src/openapi-version.js)) |
| Tests | Same reader |
| GitHub Pages catalog UI | Loads version from `docs/openapi.yaml` in the browser |
| OAS examples / schema | YAML anchor `*api_version` in `openapi.yaml` |

Sync the Pages copy before commit:

```bash
npm run sync-oas
```

(`npm test` / `npm start` run this automatically via `pretest` / `prestart`.)

## GitHub Pages (API catalog hosting)

- Branch: `master` / folder: `/docs`
- Public URL: https://tetzokabe2026.github.io/tz-note-rating-eapi/

When you update the OpenAPI contract, run `npm run sync-oas` so [`docs/openapi.yaml`](docs/openapi.yaml) matches the root spec.

## Notes

- Application testing must use Prism MOCK, never Cloud Run Production
- No authentication on published endpoints
- Git branch policy: `master` only
