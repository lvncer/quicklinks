# Quicklinks

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

- `POST /api/links` … リンクを保存（`X-QuickLink-Secret` ヘッダ必須）

### API テスト

テストスクリプトを使う（推奨）

```bash
./dev-scripts/test-api.sh
```

このスクリプトは `api/.env` から `SHARED_SECRET` を自動で読み込んでくれます。

### Web アプリ（Next.js）

（未実装、M3 以降で追加予定）

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

## ライセンス

（未定）
