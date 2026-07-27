# Evaluation Mock API

技術ノートを評価する Mock Experience API です。  
OpenAPI 契約を正とし、ローカル / Docker / Google Cloud Run で同一の振る舞いを提供します。

| | |
|---|---|
| **Version** | 1.0.0 |
| **OpenAPI** | [openapi.yaml](openapi.yaml) |
| **API Catalog (Swagger UI)** | [docs/](docs/index.html)（GitHub Pages 公開後に閲覧） |
| **Live API** | https://evaluation-mock-api-47730621722.asia-northeast1.run.app |
| **企画書** | [evaluation-mock-api-v1-project-specification.md](evaluation-mock-api-v1-project-specification.md) |

## API Catalog

このリポジトリは API カタログとしても使えるよう整備しています。

- 契約の単一ソース: ルートの [`openapi.yaml`](openapi.yaml)
- 人間向けカタログ UI: [`docs/index.html`](docs/index.html)（Swagger UI）
- GitHub Pages 用に [`docs/openapi.yaml`](docs/openapi.yaml) を同梱（ルート仕様と同期）

Pages 有効化後のカタログ URL 例:

`https://<owner>.github.io/tz-note-rating-eapi/`

### カタログに含まれる情報

- `POST /evaluations` — 評価作成（ランダム 1–5）
- `GET /evaluations/{id}` — 評価取得
- `DELETE /evaluations/{id}` — 評価削除
- リクエスト / レスポンススキーマ、バリデーションエラー形式、Try it out 用サーバー（Local / Cloud Run）

## Endpoints

| Method | Path | Success |
|--------|------|---------|
| `POST` | `/evaluations` | `201` + evaluation |
| `GET` | `/evaluations/{id}` | `200` + evaluation |
| `DELETE` | `/evaluations/{id}` | `204` |
| `GET` | `/health` | `200` `{"status":"ok"}`（運用用。ビジネスリソース外） |

評価結果はプロセス内の **in-memory** に保持します。Cloud Run のスケールインやコールドスタートで消えます。

## Quick start（Live）

```bash
BASE_URL=https://evaluation-mock-api-47730621722.asia-northeast1.run.app

curl -s -X POST "$BASE_URL/evaluations" \
  -H 'Content-Type: application/json' \
  -d '{"body":"Cursor agents execute commands in an isolated environment."}'
```

## Local development

Requirements: Node.js 20+

```bash
npm install
npm test
npm start
```

Default port: `8080`（`PORT` で変更可）

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

Prerequisites: `gcloud` 認証済み、課金有効な GCP プロジェクト、Cloud Run / Cloud Build / Artifact Registry API 有効。

### Option A — source deploy（推奨）

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

1. Artifact Registry に Docker リポジトリ `evaluation-mock-api`（`asia-northeast1`）を作成
2. ビルド投入:

```bash
gcloud builds submit --config cloudbuild.yaml \
  --substitutions=SHORT_SHA=$(git rev-parse --short HEAD)
```

デプロイ済み URL（project `http-sample-proj`, region `asia-northeast1`）:

`https://evaluation-mock-api-47730621722.asia-northeast1.run.app`

### Smoke test

```bash
BASE_URL=https://evaluation-mock-api-47730621722.asia-northeast1.run.app

curl -s -X POST "$BASE_URL/evaluations" \
  -H 'Content-Type: application/json' \
  -d '{"body":"Cursor agents execute commands in an isolated environment."}'

# レスポンスの eval-id を使う:
curl -s "$BASE_URL/evaluations/<eval-id>"
curl -s -o /dev/null -w "%{http_code}\n" -X DELETE "$BASE_URL/evaluations/<eval-id>"
```

## GitHub Pages（API カタログ公開）

1. リポジトリ Settings → Pages
2. Source: **Deploy from a branch**
3. Branch: `master` / folder: `/docs`
4. Save 後、数分でカタログ UI が公開されます

OpenAPI を更新したら、ルートの `openapi.yaml` を正として `docs/openapi.yaml` にも同じ内容を反映してください。

```bash
cp openapi.yaml docs/openapi.yaml
```

## Notes

- 認証なし（Cloud Run `--allow-unauthenticated`）
- DB なし（データはインスタンス単位で揮発）
- Git ブランチ方針: `master` のみ
