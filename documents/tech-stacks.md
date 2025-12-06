# 技術スタック一覧

## ブラウザ拡張（extension）

| 項目             | 技術                                          | 用途 / 補足                                                                                                   |
| ---------------- | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| 言語 / ビルド    | TypeScript + esbuild (target: chrome120)      | `bun x esbuild ... --bundle --format=esm` で background / content-script / web-auth-bridge / options をビルド |
| パッケージ管理   | bun                                           | リポジトリ共通で bun を使用                                                                                   |
| UI / アイコン    | 素の HTML/CSS, Lucide (static)                | シンプルなポップアップ / オプションページ                                                                     |
| 認証             | Clerk JWT テンプレート `quicklinks-extension` | Web から `window.postMessage` で同期した JWT を `chrome.storage.sync` に保存して再利用                        |
| ストレージ       | `chrome.storage.sync`                         | JWT, userId, apiBaseUrl を保存                                                                                |
| API クライアント | fetch                                         | `Authorization: Bearer <JWT>` で Go API の `/api/links` へ POST                                               |
| ビルドスクリプト | `bun x esbuild`                               | `build` / `watch` スクリプトで dist 出力                                                                      |

## Web アプリ（Next.js）

| 項目           | 技術                                      | 用途 / 補足                                        |
| -------------- | ----------------------------------------- | -------------------------------------------------- |
| フレームワーク | Next.js 16 (App Router) + React 19        | Web ダッシュボード                                 |
| 認証           | @clerk/nextjs                             | セッション取得・トークン同期（拡張へ postMessage） |
| データ取得     | SWR                                       | `/api/links`, `/api/og` のクライアントフェッチ     |
| スタイリング   | グローバル CSS, Tailwind ベース（最低限） |                                                    |
| ビルド/実行    | next build / next start                   |                                                    |
| パッケージ管理 | bun                                       |                                                    |

## API サーバー（Go + Gin）

| 項目            | 技術                                           | 用途 / 補足                                                           |
| --------------- | ---------------------------------------------- | --------------------------------------------------------------------- |
| ランタイム / FW | Go + Gin                                       | REST API (`/api/links`, `/api/og`)                                    |
| DB クライアント | pgx (postgres)                                 | Supabase/Postgres へ接続                                              |
| 認証            | clerk-sdk-go + JWT middleware                  | `Authorization: Bearer <JWT>` を検証し `user_id` をコンテキストに設定 |
| OGP 取得        | 独自サービス（`internal/service/metadata.go`） | `/api/og` で利用                                                      |
| ORM（導入予定） | ent                                            | M3.8 で導入し、スキーマ定義とコード生成を一元化予定                   |
| 設定            | `internal/config`                              | 環境変数読み込み (`DATABASE_URL`, `CLERK_SECRET_KEY`, etc.)           |

## データベース / インフラ

| 項目             | 技術                         | 用途 / 補足                                                                                               |
| ---------------- | ---------------------------- | --------------------------------------------------------------------------------------------------------- |
| DB               | Supabase / Postgres          | 本番・開発で利用                                                                                          |
| スキーマ管理     | `infra/migrations` (SQL)     | 破壊的変更は開発用で検証してから反映                                                                      |
| コンテナ         | Dockerfile (web), API は既存 | Web は M3.7 で Docker 対応、API は既にコンテナ対応済み                                                    |
| CI / CD          | GitHub Actions               | matrix で `web` / `extension` / `api` の lint/build/test、`--frozen-lockfile`、audit、`go fmt ./...` など |
| 依存アップデート | Dependabot                   | patch/minor 自動マージ、major はレビュー                                                                  |

## 開発ツール / フォーマット

| 項目                  | 技術                | 用途 / 補足                                            |
| --------------------- | ------------------- | ------------------------------------------------------ |
| パッケージ管理        | bun                 | ルートで統一運用                                       |
| フォーマッタ（JS/TS） | Biome               | `biome format --write`（web/extension を対象）         |
| フォーマッタ（Go）    | gofmt               | CI 必須、`dev-scripts/format-go.sh` で手動実行         |
| pre-commit            | Husky + lint-staged | コミット前に Biome を実行し、ステージ済みの Go ファイルにも `gofmt -w` を適用 |
| コード生成（予定）    | ent + `go generate` | ORM のコード生成（M3.8 以降）                          |
