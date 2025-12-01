# M3.5 早期デプロイ用メモ（Railway / Vercel）

## 1. API サーバー（Railway）

Go + Gin API サーバー（`api/cmd/server/main.go`）を Railway に 1 インスタンスだけ載せる想定。

### 必須環境変数（Railway 側）

- `DATABASE_URL`
  - Supabase/Postgres の接続文字列（本番用）
  - 例: `postgresql://...@db.<project>.supabase.co:5432/postgres?sslmode=require`
- `CLERK_SECRET_KEY`
  - Clerk のシークレットキー（本番プロジェクト）
  - Go 側の Clerk 検証ミドルウェア（`internal/middleware/auth.go`）で使用
- `PORT`
  - HTTP サーバーの待ち受けポート
  - `config.Load()` 内で `getenv("PORT", "8080")` として読み取り
  - Railway が自動で `PORT` を注入する前提で、**手動指定は基本不要**
- `ENVIRONMENT`
  - `development` / `production`
  - `production` の場合:
    - Gin が Release モード
    - CORS 設定で `AllowOrigins` がホワイトリスト制になる（現状 `http://localhost:3000`, `https://localhost:3000` のみ）

※ 本番で Vercel ドメインからブラウザ経由で叩く場合は、別途 `cmd/server/main.go` の CORS 設定に Vercel の URL を追加する必要あり。

### Railway のビルド / 起動（Dockerfile）

Railway は `api/Dockerfile` を使って API サーバーをビルド・起動する。

- サービスのルートディレクトリを `api/` に設定する
- Build / Start コマンドは **空のまま** で OK（Dockerfile の記述に従う）
- コンテナ内では `server` バイナリが起動し、`PORT` 環境変数（Railway が自動注入）で待ち受けポートを指定する

## 2. Web アプリ（Vercel, Next.js）

`web/` 配下の Next.js(app router) アプリを Vercel にデプロイする想定。

### 必須環境変数（Vercel 側）

`.env.local.example` と実コード（`src/lib/services/links.ts`, `src/components/LinkList.tsx` 等）からの抜粋。

- **API 呼び出し系**

  - `API_BASE_URL`
    - Server Component（`getLinks`）用の API ベース URL
    - 例: `https://<railway-app-name>.up.railway.app`
  - `NEXT_PUBLIC_API_BASE`
    - クライアントコンポーネント（`LinkList`, `LinkCard` など）用の API ベース URL
    - 例: `https://<railway-app-name>.up.railway.app`

- **Clerk 認証系**
  - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
    - Clerk の Publishable Key（フロント側）
  - `CLERK_SECRET_KEY`
    - Clerk のシークレットキー（Next.js サーバー側）
    - Clerk の公式ドキュメント通り、Vercel の **暗号化された環境変数** として設定
  - `NEXT_PUBLIC_CLERK_SIGN_IN_URL`
    - 例: `/sign-in`
  - `NEXT_PUBLIC_CLERK_SIGN_UP_URL`
    - 例: `/sign-up`

### Vercel のビルド / 起動コマンド

`web/package.json` より:

- **Build command**
  - `npm run build`
  - 内部的には `next build`
- **Dev / Start（参考）**
  - 開発時: `npm run dev` → `next dev`
  - 本番起動: Vercel 側で自動（Next.js プロジェクトとして扱われる）

Vercel のプロジェクト設定では、フレームワークを **Next.js** にしておけば、Install/Start コマンドはデフォルトのままで問題ない想定。
