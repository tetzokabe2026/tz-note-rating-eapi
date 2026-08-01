# Session Handoff — tz-note-rating-eapi

新しいチャットへ作業を引き継ぐためのメモ（2026-08-01 時点）。

## プロジェクト

**`tz-note-rating-eapi`** — Evaluation Mock API（OpenAPI 契約が正）

関連リポジトリ: **`tz-cicd-server`**（Jenkins / Prism MOCK デプロイ）

---

## 完了した作業（EAPI / PR #1 — マージ済み）

- **`elegance`** 評価項目追加（integer 1–5、POST 時ランダム）
- **`GET /version`** → `{"version":"1.0.1"}`（OAS 契約上の API バージョン）
- **`/health`** は OAS 外のまま（運用用、`{"status":"ok"}`）
- PR: https://github.com/tetzokabe2026/tz-note-rating-eapi/pull/1（マージコミット `4c272c1`）

### 変更ファイル（EAPI）

| ファイル | 内容 |
|----------|------|
| `openapi.yaml` / `docs/openapi.yaml` | `elegance`, `/version`, `Version` スキーマ |
| `src/ratings.js` | `elegance: randomRating()` |
| `src/app.js` | `GET /version` |
| `test/evaluations.test.js` | 上記のテスト |
| `README.md` / `README-JP.md` | ドキュメント更新 |

---

## 環境

| 環境 | URL | 状態 |
|------|-----|------|
| **Prism MOCK（試験用）** | https://evaluation-oas-prism-i7pbbhm3ja-an.a.run.app | **更新済み**（elegance + /version） |
| **Cloud Run 本番（Express）** | https://evaluation-mock-api-47730621722.asia-northeast1.run.app | 再デプロイ未確認 |
| **GitHub Pages カタログ** | https://tetzokabe2026.github.io/tz-note-rating-eapi/ | master merge で自動更新 |
| **ローカル** | `npm start` → `:8080` | 動作確認済み |

### Prism 動作確認コマンド

```bash
curl -s https://evaluation-oas-prism-i7pbbhm3ja-an.a.run.app/version
curl -s -X POST https://evaluation-oas-prism-i7pbbhm3ja-an.a.run.app/evaluations \
  -H 'Content-Type: application/json' \
  -d '{"body":"Cursor agents execute commands in an isolated environment."}'
```

期待値: `/version` → `{"version":"1.0.1"}`、POST → `elegance` を含む JSON。

---

## Prism 自動更新（`tz-cicd-server`）

**方針:** Cloud Build は使わず、既存 **Jenkins（jenkins-demo）** で `prism-oas-reload` ジョブ。

### 実装済み（`tz-cicd-server` master）

| 成果物 | パス |
|--------|------|
| Bootstrap スクリプト | `scripts/jenkins-bootstrap-prism-oas-reload-job.sh` |
| Jenkinsfile | `prism-mock/pipeline/Jenkinsfile.prism-oas-reload` |
| reload オーケストレーション | `prism-mock/scripts/reload.sh` |
| oas-sync 修正 | `prism-mock/modules/oas-sync/run.sh`（ログは stderr、stdout は version のみ） |
| restart 修正 | `prism-mock/modules/restart/run.sh`（同上） |
| ドキュメント | `prism-mock/README.md` |

### Jenkins

| 項目 | 値 |
|------|-----|
| Job 名 | **`prism-oas-reload`** |
| VM | `jenkins-demo`（GCP `tz-cicd-demo-tetzokabe`） |
| IP | `34.104.235.50` |
| Job 登録 | 済み（`ai-technical-notes-db-deploy`, `client-deploy`, `eapi-client-sync` と並列） |
| State | `/var/lib/jenkins/prism-mock/last-applied-eapi-version.txt` → `1.0.1` |

### GitHub Webhook（本リポジトリ `tz-note-rating-eapi`）

| ジョブ | Hook ID | URL パターン |
|--------|---------|--------------|
| `eapi-client-sync` | `658101550` | `http://34.104.235.50:8080/job/eapi-client-sync/buildWithParameters?token=...` |
| `prism-oas-reload` | `659858093` | `http://34.104.235.50:8080/job/prism-oas-reload/buildWithParameters?token=...&EAPI_BRANCH=master` |

初回 Prism reload は **ローカル `prism-mock/scripts/reload.sh`** で実行済み（Jenkins ビルド経由ではない）。

---

## 未完了 / 次の作業

1. **Jenkins リモートビルド 403** — `build-token-root` プラグイン未導入、または UI で **Trigger builds remotely** 未有効。GitHub Webhook ping も 403。
2. **Generic Webhook Trigger** — `/generic-webhook-trigger/invoke` が Job 未検出（404）の事象あり。Jenkins UI で Generic Webhook Trigger を確認。
3. **Jenkins CLI** — VM 上で `Unexpected request origin` 403。bootstrap は config.xml 直接配置で回避済み。
4. **Express 本番 Cloud Run** — 別 GCP プロジェクト（`47730621722`）。`master` merge 後の再デプロイ未確認。
5. **企画書** [`evaluation-mock-api-v1-project-specification.md`](evaluation-mock-api-v1-project-specification.md) — 意図的に未更新（3項目のまま）。

---

## 運用ルール

- OAS を変更したら **`info.version` を bump**（semver ゲート。bump なしだと `prism-oas-reload` はスキップ）
- アプリ試験は **Prism MOCK 必須**。Cloud Run 本番（Express）は禁止
- OAS 更新後: `cp openapi.yaml docs/openapi.yaml`（GitHub Pages 同期）

### 推奨 CI 順序

```text
EAPI master merge
  → prism-oas-reload（Prism 更新）
  → eapi-client-sync（Wait GET /version → 結合試験 → client PR）
  →（人）client main merge
  → client-deploy
```

---

## 新チャットでの続き方

1. このファイルを `@HANDOFF.md` で参照
2. 必要なら `@openapi.yaml`、`tz-cicd-server` の `prism-mock/README.md` も添付
3. Agent モードで例:

```text
HANDOFF.md を読んで、Jenkins prism-oas-reload のリモートトリガー（403）を直し、
GitHub Webhook から自動実行できるようにして。
```

---

## ローカル開発メモ

```bash
npm install
npm test          # 9 tests
npm start         # :8080（既存プロセスがあると EADDRINUSE → kill または PORT=8081）
```

**注意:** Postman / curl のパスは **`/evaluations`**（`/validations` ではない）。
