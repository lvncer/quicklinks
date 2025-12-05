# 将来的なファイルツリー（完成系イメージ）

最終的に目指すモノレポ構成のイメージ。実際の実装時には細かいファイル名は変わる可能性があるが、レイヤー構造と責務の単位感を示す。

```sh
quicklinks/
├── README.md
├── package.json                    # ルート共通ツール用（lint, format など）
├── turbo.json / nx.json            # （任意）モノレポツール設定
├── .gitignore
│
├── documents/
│
├── infra/
│   ├── migrations/
│   │   └── 001_init_links.sql
│   └── supabase/
│       ├── schema.sql              # Supabase に流したいスキーマ定義
│       └── seed_dev.sql            # 開発用シードデータ
│
├── extension/
│   ├── manifest.json               # Chrome 拡張機能マニフェスト (V3)
│   ├── options.html                # 設定ページ
│   ├── src/
│   │   ├── background.ts           # API 呼び出し
│   │   ├── content-script.ts       # 長押し検出＋Saveボタン表示
│   │   ├── options.ts              # 設定ページのロジック
│   │   ├── api.ts                  # API クライアント
│   │   ├── storage.ts              # 設定保存（API ベース URL など）
│   │   └── ui/
│   │       └── toast.ts            # 保存完了トースト
│   ├── icons/
│   └── dist/                       # ビルド成果物
│
├── api/                            # Go + Gin API サーバー
│   ├── go.mod
│   ├── go.sum
│   ├── .env.example
│   ├── cmd/
│   │   └── server/
│   │       └── main.go             # エントリポイント
│   └── internal/
│       ├── config/
│       │   └── config.go           # env 読み込み
│       ├── db/
│       │   ├── pg.go               # pgx 接続プール
│       │   └── migrate.go          # （任意）マイグレーション実行ヘルパ
│       ├── model/
│       │   ├── link.go             # Link / LinkCreateRequest
│       │   ├── digest.go           # Digest / DigestItem
│       │   ├── user.go
│       │   ├── tag.go
│       │   └── job.go
│       ├── handler/
│       │   ├── links.go            # POST /api/links, GET /api/links
│       │   ├── digests.go          # 週次・月次ダイジェスト用 API
│       │   └── health.go           # /health
│       ├── service/
│       │   ├── link_service.go     # ビジネスロジック（リンク登録など）
│       │   └── digest_service.go   # ダイジェスト生成ロジック（AI 呼び出し含む）
│       ├── worker/
│       │   ├── queue.go            # ジョブキュー管理（Redis 等）
│       │   └── jobs/
│       │       ├── fetch_og.go     # OG/メタデータ取得ジョブ
│       │       └── summarize_week.go # 週次ダイジェスト生成ジョブ
│       └── util/
│           ├── logger.go
│           └── http_error.go
│
├── web/                            # Next.js アプリ
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.js
│   ├── .env.local.example
│   └── src/
│       ├── app/
│       │   ├── favicon.ico
│       │   ├── globals.css
│       │   ├── layout.tsx
│       │   ├── page.tsx            # 最近のリンク一覧
│       │   ├── links/
│       │   │   └── page.tsx        # フィルタ付きリンク一覧
│       │   ├── digests/
│       │   │   ├── page.tsx        # 自分のダイジェスト一覧
│       │   │   └── [slug].tsx      # 公開ダイジェスト表示
│       │   └── api/
│       │       └── proxy-links.ts  # （任意）API サーバーへの proxy
│       ├── components/
│       │   ├── layout/
│       │   │   ├── AppLayout.tsx
│       │   │   ├── Header.tsx
│       │   │   └── Sidebar.tsx
│       │   ├── links/
│       │   │   ├── LinkList.tsx
│       │   │   ├── LinkItem.tsx
│       │   │   └── LinkFilterBar.tsx
│       │   ├── digests/
│       │   │   └── DigestCard.tsx
│       │   └── ui/
│       │       ├── Button.tsx
│       │       ├── Spinner.tsx
│       │       └── Badge.tsx
│       └── lib/
│           ├── apiClient.ts        # API 呼び出しラッパ
│           └── supabaseClient.ts   # Supabase クライアント（read 用）
│
├── dev-scripts/
│   ├── run-api-local.sh
│   ├── run-web-local.sh
│   └── sync-supabase-schema.sh
│
└── .github/
    └── workflows/
        ├── ci.yml                  # lint / test / build
        ├── deploy-api.yml          # API デプロイ（任意）
        └── deploy-web.yml          # Web デプロイ（任意）
```
