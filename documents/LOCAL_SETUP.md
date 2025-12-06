# ローカル開発

## 前提

- Go 1.25+
- Node.js + Bun
- Supabase プロジェクト（DB 接続用）

## API サーバー（Go + Gin）

1. `api/.env` を作成（`.env.example` を参考）

2. ローカルで実行:

   ```bash
   cd api
   go run ./cmd/server
   ```

## 開発環境の一括起動

API サーバーと Web アプリを同時に起動するスクリプト:

```bash
./dev-scripts/run-all.sh
```

停止する場合:

Ctrl+C を押すか、 `./dev-scripts/stop-all.sh`を実行してください。

## API テスト

テストスクリプトを使う（推奨）

```bash
./dev-scripts/test-api.sh
```

このスクリプトは `api/.env` から `SHARED_SECRET` を自動で読み込んでくれます。

## Web アプリ（Next.js）

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

## ブラウザ拡張

1. `extension/` ディレクトリに移動

2. 依存関係をインストール:

   ```bash
   cd extension
   bun i
   ```

3. ビルド:

   ```bash
   bun run build
   ```

4. Chrome にロード:

   - `chrome://extensions/` を開く
   - 「デベロッパーモード」を有効化
   - 「パッケージ化されていない拡張機能を読み込む」で `extension` フォルダを選択

詳細は [`extension/README.md`](extension/README.md) を参照。

---

## Docker 関連

### API 用 Docker イメージ

- 定義ファイル: `api/Dockerfile`
- 概要:
  - Go 公式イメージ + マルチステージビルド
  - ビルドステージで `api/go.mod` / `api/go.sum` を使って依存解決
  - `CGO_ENABLED=0`, `GOOS=linux`, `GOARCH=amd64` で静的バイナリ `server` をビルド
  - ランタイムステージ（`alpine:3.20`）にバイナリだけコピーして軽量コンテナとして起動
- 公開ポート: `8080`

### Web 用 Docker イメージ

- 定義ファイル: `web/Dockerfile`
- 概要:
  - `node:20-alpine` ベースのマルチステージ構成
  - ビルドステージ:
    - `web/package.json` をコピーして `npm install --omit=dev`
    - `web/` 一式をコピーして `npm run build`
  - ランタイムステージ:
    - `/app` にビルド済み成果物と `node_modules` をコピー
    - `npm run start` で Next.js を起動
- 公開ポート: `3000`

※ 本番向けのイメージビルド手順やレジストリ連携は、デプロイ先のインフラに合わせて別途整備する。

---

## 全コンポーネントのクリーン & ビルド

開発環境または CI 相当のチェックとして、API / Web / Extension をまとめてビルドするスクリプトがあります。

- スクリプト: `./dev-scripts/build-all.sh`
- やっていること:
  - API (`api/`):
    - `go clean ./...`
    - `go fmt ./...`
    - `go test ./...`
    - `go build ./cmd/server`
  - Web (`web/`):
    - Bun があれば: `bun install` → `bun run build`
    - Bun が無ければ: `npm install` → `npm run build`
  - Extension (`extension/`):
    - Bun があれば: `bun install` → `bun run build`
    - Bun が無ければ: `npm install` → `npm run build`

### 使い方

```bash
chmod +x ./dev-scripts/build-all.sh  # 初回のみ
./dev-scripts/build-all.sh
```

ビルドがすべて通れば、各コンポーネントの依存関係と基本的なビルドは問題ない状態とみなせます。
