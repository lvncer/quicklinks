# CI 概要

このプロジェクトでは、GitHub Actions と Dependabot を使って、Lint / Build / Test と依存関係更新を自動化しています。

## GitHub Actions: アプリケーション CI

- 設定ファイル: `.github/workflows/ci.yml`
- トリガー:
  - `push`（ブランチ: `main`）
  - `pull_request`（向き先: `main`）
- ジョブ構成:
  - `matrix.service: [web, extension, api]`
  - 各サービスごとに独立したジョブとして実行

### 共通

- `actions/checkout@v4` でリポジトリを取得

### web / extension (Bun + Node.js)

- Bun セットアップ
  - `uses: oven-sh/setup-bun@v2`
  - `bun-version: 1.3.3`
- 依存インストール（ロックファイル前提）
  - ルート: `bun install --frozen-lockfile`
  - `web/`: `bun install --frozen-lockfile`
  - `extension/`: `bun install --frozen-lockfile`

#### web ジョブ

- Lint
  - `working-directory: web`
  - `bun run lint`
- Build
  - `working-directory: web`
  - `bun run build`
- 依存チェック（ざっくり）
  - `working-directory: web`
  - `bun audit`

#### extension ジョブ

- Build
  - `working-directory: extension`
  - `bun run build`
- 依存チェック
  - `working-directory: extension`
  - `bun audit`

### api (Go)

- Go セットアップ
  - `uses: actions/setup-go@v5`
  - `go-version-file: api/go.mod`
- フォーマット
  - `working-directory: api`
  - `go fmt ./...`
- テスト
  - `working-directory: api`
  - `go test ./...`
- ビルド
  - `working-directory: api`
  - `go build ./cmd/server`

## Dependabot と自動マージ

- 設定ファイル: `.github/dependabot.yml`
- 対象エコシステム:
  - `npm`（ルート `/`）
  - `npm`（`/web`）
  - `npm`（`/extension`）
  - `github-actions`（ルート `/`）
- スケジュール: すべて `weekly`

### 自動マージポリシー

- ワークフロー: `.github/workflows/dependabot-automerge.yml`
- トリガー: Dependabot が作成した PR に対する `pull_request` イベント
- 実装概要:
  - `dependabot/fetch-metadata@v2` で PR のメタデータを取得
  - 以下を満たす PR を `gh pr merge --merge --auto` で自動マージ
    - PR 作成者が `dependabot[bot]`
    - `dependency-type == direct`（直接依存）
    - かつ update-type が以下のいずれか
      - `security`
      - `version-update:semver-patch`
      - `version-update:semver-minor`
- それ以外（major 更新など）は、自動マージされず、手動レビューが必要

## ローカル開発との関係

- ローカルでは、以下でフォーマットやチェックが走る運用:
  - Husky + lint-staged（`pre-commit`）
    - Biome による TS/JS/JSON/MD のフォーマット
    - `gofmt -w` による Go ファイルのフォーマット
  - `./dev-scripts/format-go.sh` で API の Go コードを一括フォーマット
- CI では、上記に加えて
  - Web/Extension の Build + `bun audit`
  - API の `go test` / `go build`
    が定期的に実行される
