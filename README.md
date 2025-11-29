# Quicklinks

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

気になった Web ページの URL をブラウザ拡張から一瞬で保存して、あとから Web ダッシュボードで見返したり、将来は週次・月次ダイジェストにまとめられるようにするアプリ。

## 構成

- **API サーバー**: Go + Gin (`api/`)
- **Web アプリ**: Next.js (`web/`)
- **インフラ / DB スキーマ**: Supabase / Postgres (`infra/`)
- **ブラウザ拡張**: Chrome Extension MV3 (`extension/`)

## ドキュメント

- 詳しいアーキテクチャは [`documents/architecture.md`](documents/architecture.md) を参照。
- マイルストーン・実装順序は [`documents/milestones.md`](documents/milestones.md) を参照。

## ローカル開発

### 前提

- Go 1.25+
- Docker
- Supabase プロジェクト（DB 接続用）

### API サーバー（Go + Gin）

1. `api/.env` を作成（`.env.example` を参考）

2. ローカルで実行:

   ```bash
   cd api
   go run ./cmd/server
   ```

### API エンドポイント

- `POST /api/links` … リンクを保存（`X-QuickLink-Secret` ヘッダ必須、M3.1 で Clerk 認証に移行予定）
- `GET /api/links` … リンク一覧取得（`X-QuickLink-Secret` ヘッダ必須、M3.1 で Clerk 認証に移行予定）
- `GET /api/og` … OGP 情報取得（`X-QuickLink-Secret` ヘッダ必須、M3.1 で Clerk 認証に移行予定）
  - クエリパラメータ: `url` (必須)
  - レスポンス: `{ title, description, image, date }`（`date` は記事の公開日/更新日、取得できない場合は `null`）

### 開発環境の一括起動

API サーバーと Web アプリを同時に起動するスクリプト:

```bash
./dev-scripts/run-all.sh
```

停止する場合:

```bash
./dev-scripts/stop-all.sh
```

### API テスト

テストスクリプトを使う（推奨）

```bash
./dev-scripts/test-api.sh
```

このスクリプトは `api/.env` から `SHARED_SECRET` を自動で読み込んでくれます。

### Web アプリ（Next.js）

1. `web/.env.local` を作成（`.env.local.example` を参考）

2. 環境変数を設定:

   - `API_BASE_URL`: Go API サーバーの URL（例: `http://localhost:8080`）
   - `SHARED_SECRET`: API 認証用の共有シークレット（`api/.env` の `SHARED_SECRET` と同じ値）

3. ローカルで実行:

   ```bash
   cd web
   bun run dev
   ```

4. ブラウザで `http://localhost:3000` にアクセス

**注意**: 現在は `SHARED_SECRET` による認証を使用していますが、M3.1 で Clerk 認証に移行予定です。

### ブラウザ拡張

1. `extension/` ディレクトリに移動

2. 依存関係をインストール:

   ```bash
   cd extension
   bun install
   ```

3. ビルド:

   ```bash
   bun run build
   ```

4. Chrome にロード:

   - `chrome://extensions/` を開く
   - 「デベロッパーモード」を有効化
   - 「パッケージ化されていない拡張機能を読み込む」で `extension` フォルダを選択

5. 設定:
   - 拡張機能のオプションページで API Base URL と Shared Secret を設定

詳細は [`extension/README.md`](extension/README.md) を参照。

## 認証について

現在は `SHARED_SECRET` による API キー認証を使用していますが、**M3.1 で Clerk 認証に完全移行予定**です。

- **現状（M3）**: `X-QuickLink-Secret` ヘッダーによる認証
- **将来（M3.1）**: Clerk の JWT トークンによる認証

詳細は [`documents/milestones.md`](documents/milestones.md) の M3.1 を参照してください。
