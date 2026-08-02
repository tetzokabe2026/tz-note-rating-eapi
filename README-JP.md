# Evaluation Mock API

技術ノートを評価する Mock Experience API です。  
OpenAPI 契約を正とします。

> English: [README.md](README.md)

| | |
|---|---|
| **Version** | [`openapi.yaml`](openapi.yaml) → `info.version` |
| **OpenAPI** | [openapi.yaml](openapi.yaml) |
| **API Catalog (Swagger UI)** | https://tetzokabe2026.github.io/tz-note-rating-eapi/ |
| **Prism MOCK（アプリ試験用）** | https://evaluation-oas-prism-i7pbbhm3ja-an.a.run.app |
| **本番（Cloud Run）— 試験禁止** | https://evaluation-mock-api-47730621722.asia-northeast1.run.app |
| **企画書** | [evaluation-mock-api-v1-project-specification.md](evaluation-mock-api-v1-project-specification.md) |

## 警告: アプリ開発・試験は Prism MOCK を使え

**Cloud Run は本番（Production）です。** アプリケーション開発や結合テストから本番を呼び出してはいけません。

| 環境 | URL | アプリ試験 |
|------|-----|------------|
| **Prism MOCK** | https://evaluation-oas-prism-i7pbbhm3ja-an.a.run.app | **必須** |
| **Cloud Run 本番** | https://evaluation-mock-api-47730621722.asia-northeast1.run.app | **禁止** |

## API Catalog

- 契約の単一ソース: [`openapi.yaml`](openapi.yaml)
- 人間向けカタログ UI: [`docs/index.html`](docs/index.html)
- Pages 用コピー: [`docs/openapi.yaml`](docs/openapi.yaml)

カタログ URL: https://tetzokabe2026.github.io/tz-note-rating-eapi/

### 評価レスポンス項目

| Field | Type | Range |
|-------|------|-------|
| `eval-id` | string | 評価 ID |
| `usefulness` | integer | 1–5 |
| `importance` | integer | 1–5 |
| `credibility` | integer | 1–5 |
| `personable` | integer | 1–5 |

## Endpoints

| Method | Path | Success |
|--------|------|---------|
| `POST` | `/evaluations` | `201` + evaluation |
| `GET` | `/evaluations/{id}` | `200` + evaluation |
| `DELETE` | `/evaluations/{id}` | `204` |
| `GET` | `/version` | `200` + `{"version":"<info.version>"}` |
| `GET` | `/health` | `200` `{"status":"ok"}`（運用用） |

## Quick start（Prism MOCK）

```bash
BASE_URL=https://evaluation-oas-prism-i7pbbhm3ja-an.a.run.app

curl -s -X POST "$BASE_URL/evaluations" \
  -H 'Content-Type: application/json' \
  -d '{"body":"Cursor agents execute commands in an isolated environment."}'
```

## ローカル開発（実装者向け）

```bash
npm install
npm test
npm start
```

localhost は API カタログのサーバー一覧には含めません。

## バージョン（単一ソース）

**[`openapi.yaml`](openapi.yaml) の `info.version` だけを編集**してください。他はそこから派生します。

| 利用先 | 方法 |
|--------|------|
| Express `GET /version` | 起動時に `openapi.yaml` を読む（[`src/openapi-version.js`](src/openapi-version.js)） |
| テスト | 同上 |
| GitHub Pages カタログ | ブラウザが `docs/openapi.yaml` から表示 |
| OAS 内の example | YAML アンカー `*api_version` |

コミット前に Pages 用コピーを同期:

```bash
npm run sync-oas
```

（`npm test` / `npm start` でも `pretest` / `prestart` 経由で自動実行されます。）

## Notes

- アプリ試験は Prism MOCK 必須。Cloud Run 本番は禁止
- 認証なし
- Git ブランチ方針: `master` のみ
