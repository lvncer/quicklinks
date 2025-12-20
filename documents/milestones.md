# マイルストーン

このプロジェクトを進めるときの「実装順」のざっくりなロードマップ。あとで変えても OK な前提で、今の時点の完成形から逆算している。

全ての変更履歴は [CHANGELOG.md](/CHANGELOG.md) を参照してください。

## 目次と進捗

| 番号                                                     | マイルストーン                           | 完了 | 完了日     | PR                                                  |
| -------------------------------------------------------- | ---------------------------------------- | ---- | ---------- | --------------------------------------------------- |
| [M0](#m0-コンセプト固定--インフラ準備)                   | コンセプト固定 & インフラ準備            | ✅   |            |                                                     |
| [M1](#m1-api-サーバー最小実装リンク保存)                 | API サーバー最小実装（リンク保存）       | ✅   | 2025-11-27 | [#1](https://github.com/lvncer/quicklinks/pull/1)   |
| [M2](#m2-ブラウザ拡張-mvpスマホ長押し--pc-右クリック)    | ブラウザ拡張 MVP（PC 右クリック）        | ✅   | 2025-11-28 | [#2](https://github.com/lvncer/quicklinks/pull/2)   |
| [M3](#m3-web-ダッシュボード-mvpリンク一覧)               | Web ダッシュボード MVP （リンク一覧）    | ✅   | 2025-11-28 | [#3](https://github.com/lvncer/quicklinks/pull/3)   |
| [M3.1](#m31-clerk-認証への完全移行-)                     | Clerk 認証への完全移行                   | ✅   | 2025-11-30 | [#4](https://github.com/lvncer/quicklinks/pull/4)   |
| [M3.5](#m35-早期デプロイプライベート本番)                | 早期デプロイ（プライベート本番）         | ✅   | 2025-12-02 |                                                     |
| [M3.6](#m36-拡張--web-の設定フロー改善)                  | 拡張 & Web の設定フロー改善              | ✅   | 2025-12-03 | [#7](https://github.com/lvncer/quicklinks/pull/7)   |
| [M3.7](#m37-開発基盤の強化docker-ci-依存関係)            | 開発基盤の強化 （Docker, CI, 依存関係）  | ✅   | 2025-12-06 | [#9](https://github.com/lvncer/quicklinks/pull/9)   |
| [M3.8](#m38-go-api-の-orm-導入ent)                       | Go API の ORM 導入 （ent）               | ✅   | 2025-12-10 | [#23](https://github.com/lvncer/quicklinks/pull/23) |
| [M3.8.5](#m385-api-本番ホスティングの-render-移行-)      | API 本番ホスティングの Render 移行       | ✅   | 2025-12-10 |                                                     |
| [M3.9](#m39-ルートページを紹介-lp-化)                    | ルートページを紹介 LP 化                 | ✅   | 2025-12-12 | [#24](https://github.com/lvncer/quicklinks/pull/24) |
| [M4](#m4-検索フィルタリング--タグ使い勝手の向上-)        | 検索フィルタリング（タグ使い勝手の向上） | ✅   | 2025-12-15 | [#25](https://github.com/lvncer/quicklinks/pull/25) |
| [M4.1](#m41-リンク一覧のルート化--フィルター-ui-改善)    | リンク一覧のルート化・フィルター UI 改善 | ✅   | 2025-12-15 | [#26](https://github.com/lvncer/quicklinks/pull/26) |
| [M4.2](#m42-週次月次クイックフィルター)                  | 週次/月次クイックフィルター              |      |            |                                                     |
| [M4.5](#m45-web-ui-でリンクの更新削除memo)               | Web UI でリンクの更新削除                |      |            |                                                     |
| [M4.6](#m46-拡張-ui-でメモ付き保存)                      | 拡張 UI でメモ付き保存                   |      |            |                                                     |
| [M5](#m5-ダイジェスト生成の土台手動トリガ)               | ダイジェスト生成の土台手動トリガ         |      |            |                                                     |
| [M6](#m6-ai-要約の磨き込み自動ジョブなし)                | AI 要約の磨き込み自動ジョブなし          |      |            |                                                     |
| [M7](#m7-本番運用安全性の強化)                           | 本番運用安全性の強化                     |      |            |                                                     |
| [M7.5](#m75-アプリ領域を分離)                            | アプリ領域を分離                         |      |            |                                                     |
| [M8](#m8-自動ジョブ--通知最終版)                         | 自動ジョブ通知最終版                     |      |            |                                                     |

## M0: コンセプト固定 & インフラ準備

- **目的**: 方向性とインフラの前提を固めて、いつでもコードを書き始められる状態にする。
- **やること**
  - Supabase プロジェクト作成
    - 本番兼開発にするか、dev/prod を分けるか方針を決める
  - `personal-news` モノレポの初期化
    - ルートに `README.md`, `.gitignore` を用意
  - DB 初期スキーマを用意（`links` の最低限スキーマ）
    - 現在は Ent schema + Atlas versioned migrations（`api/ent/migrate/migrations/`）で管理
  - `api/.env.example`, `web/.env.local.example` を用意
    - `DATABASE_URL`, `NEXT_PUBLIC_API_BASE`, `SHARED_SECRET` などを定義

## M1: API サーバー最小実装（リンク保存）

- **目的**: 拡張や curl から URL を投げれば、Supabase 上の `links` に 1 行入る状態をつくる。
- **やること**
  - `api/` に Go + Gin プロジェクトを作成
    - `cmd/server/main.go` で HTTP サーバー起動
    - `internal/config`, `internal/db`（pgx）を実装
  - `POST /api/links` を実装
    - `X-QuickLink-Secret` の検証
    - `LinkCreateRequest` のバリデーション
    - `links` への INSERT と `id` の返却
  - ローカルから curl / REST クライアントで動作確認

## M2: ブラウザ拡張 MVP（スマホ長押し + PC 右クリック）

- **目的**: 実際のブラウジング中に、スマホ長押し or PC 右クリックから URL を保存できるようにする。
- **やること**
  - `extension/` に拡張用プロジェクトを作成
    - `manifest.json`（Manifest V3）
    - `src/content-script.ts`（モバイル向け長押し検出 + `Save` ボタン）
    - `src/context-menu.ts`（PC 向け `contextMenus` で「Save link ...」を追加）
    - `src/background.ts`（必要なら API 呼び出しをここで行う）
  - `X-QuickLink-Secret` をヘッダに付けて `POST /api/links` を叩く
  - `chrome://extensions` から unpacked load して、実際のページで保存できるか確認

## M3: Web ダッシュボード MVP（リンク一覧）

- **目的**: 保存されたリンクを Web で一覧表示できるようにする。
- **やること**
  - `web/` に Next.js（app router）プロジェクトを作成
    - `src/app/page.tsx` … 最近保存したリンク一覧
  - API からの取得（API 経由で統一）
    - `GET {NEXT_PUBLIC_API_BASE}/api/links?limit=...` を叩いて一覧取得
    - `lib/apiClient.ts` に簡単なフェッチラッパを作る
    - 拡張機能と同じ API エンドポイントを使用することで一貫性を保つ
    - 将来的な認証・認可やビジネスロジックの追加に備える
  - UI は最小限で OK
    - URL / タイトル / ドメイン / 保存日時 をリスト表示
  - OGP 情報の取得（Go API 経由）
    - `GET /api/og` エンドポイントを Go API に実装
    - 表示時に各リンクの URL から OGP 情報（タイトル、Description、OG Image）をリアルタイム取得
    - リンク保存時にも OGP 情報を取得して DB に保存（フォールバック用）
    - `internal/service/metadata.go` の `FetchMetadata` 関数を使用
  - useSWR によるキャッシュと自動更新
    - クライアントサイドでのデータ取得とリアルタイム更新
    - 各リンクカードが個別に OGP 情報を取得するため、非同期に読み込まれる
  - 日付表示とソート
    - リンク一覧は `saved_at`（保存日）でソート
    - `LinkCard` では `saved_at` を表示（公開日/更新日概念は撤去）

## M3.1: Clerk 認証への完全移行 ✅

- **目的**: API キー方式から Clerk 認証に移行し、セキュアでスケーラブルな認証基盤を構築する。
- **ステータス**: 実装完了
- **認証タイミング**:
  - **ブラウザ拡張機能**: 初回起動時（または未認証時）に Clerk でログイン → トークンを Chrome Storage に保存 → 以降のリンク保存時に保存済みトークンを使用
  - **Web アプリ**: ページアクセス時に認証状態を確認 → 未認証ならログイン画面を表示 → 認証済みならデータを取得・表示
  - **リンク登録時**: 拡張機能側でトークンがあればそのまま使用、トークンがない/期限切れならログインを促す
- **実装内容**
  - **データベース**
    - `user_identifier` を `user_id` にリネーム
  - **拡張機能側**
    - `chrome.identity.launchWebAuthFlow` による Clerk 認証フロー（`src/auth.ts`）
    - トークンを Chrome Storage に保存・管理（`src/storage.ts`）
    - `Authorization: Bearer <token>` ヘッダーで API リクエストを送信（`src/api.ts`）
    - Options ページにログイン/ログアウト UI を追加（`options.html`, `src/options.ts`）
    - `identity` パーミッションを追加（`manifest.json`）
  - **Go API 側**
    - Clerk の JWT トークンを検証するミドルウェア（`internal/middleware/auth.go`）
    - トークンから `user_id` を取得し、DB に保存（`internal/handler/links.go`）
    - `CLERK_SECRET_KEY` 環境変数を使用（`internal/config/config.go`）
    - サーバーエントリポイント（`cmd/server/main.go`）
  - **Web アプリ側**
    - `@clerk/nextjs` による認証（`src/app/layout.tsx`）
    - 認証ミドルウェア（`src/middleware.ts`）
    - Sign-in / Sign-up ページ
    - API Route で Clerk トークンを取得して Go API に転送

## M3.5: 早期デプロイ（プライベート本番）

- **目的**: 自分（＋ごく少人数）が実際の環境で触りながらフィードバックを回せる状態にする。
- **やること**
  - API 側
    - 既存の Go/Gin サーバーを Render のマネージド環境に 1 インスタンスだけデプロイ
    - Supabase の `DATABASE_URL` を本番用環境変数として設定
    - `CLERK_SECRET_KEY` を環境変数で設定
  - Web 側
    - Next.js アプリを Vercel にデプロイ
    - `NEXT_PUBLIC_API_BASE` をデプロイ済み API の URL に向ける
    - Clerk の環境変数を設定（`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`）
  - 運用メモ
    - 簡単なデプロイ手順を `README` や `documents/20251120_memo.md` にメモしておく
    - この段階ではドメインや CI/CD はまだ最低限で OK（手動デプロイでよい）

## M3.6: 拡張 & Web の設定フロー改善

- **目的**: 「API URL の設定」と「Clerk ログイン」を Web ベースで一体化し、拡張のセットアップをシンプルにする。
- **やること**
  - Web 側
    - `ExtensionAuthSync` から拡張へ送るメッセージに `apiBaseUrl` も含める
      - 例: `process.env.NEXT_PUBLIC_API_BASE` を含めて postMessage → background が storage に保存
  - 拡張側
    - `background.ts` の `handleSaveAuthMessage` で受け取った `apiBaseUrl` を `saveConfig` で同期
    - `storage.ts` の `DEFAULT_CONFIG.apiBaseUrl` を本番 API URL に寄せる（開発時のみオプションで上書き）
    - `options.ts` で API URL 入力時に `http(s)://` が無ければ自動補完するなど、軽いバリデーションを追加

## M3.7: 開発基盤の強化（Docker, CI, 依存関係）

- **目的**: Web をコンテナ対応し、全コンポーネントの CI を整備、依存関係更新を安全に自動化する。
- **やること**
  - Docker
    - `web/` に Dockerfile を追加（API は既に対応済み、extension は毎回ビルドするため今回は対象外）
    - API / Web / Extension のクリーン & ビルドをまとめる `dev-scripts/build-all.sh` を用意
    - ローカル検証用に `docker-compose.yml` で `api` + `web` を同時起動できるようにする
  - GitHub Actions
    - matrix で `web`, `extension`, `api` の lint / build / test を実行
    - トリガー: `pull_request`（main 向け）、`push`（main）
    - 依存インストールは `--frozen-lockfile` を必須
    - ざっくりした依存チェック（`pnpm audit` / `npm audit` 相当）を追加
  - 共通フロントエンドツール（bun ベースでルートに集約）
    - ルート `package.json` を bun 管理にして、`@biomejs/biome`, `husky`, `lint-staged` を devDependencies に追加
    - `biome format --write` を `web/` と `extension/` の `*.{ts,tsx,js,jsx,json,md}` に適用
    - Husky `pre-commit` で `lint-staged` を実行（コミット前フォーマット）
    - lint-staged でステージ済みの Go ファイルにも `gofmt -w` を実行する。
  - Go フォーマット
    - CI で `go fmt ./...` を必須にする
    - 手動実行用に `dev-scripts/format-go.sh`（中身は `go fmt ./...`）を追加しておく
  - Dependabot / 自動マージ
    - セキュリティ更新・patch/minor の依存アップデートは自動マージ
    - major 更新はレビュー必須

## M3.8: Go API の ORM 導入（ent）

- **目的**: Go API のクエリを型安全にし、スキーマ定義とコード生成・マイグレーション管理を一元化する。
- **やること**
  - `api/` に ent を導入し、`ent/schema` で `links` テーブルのスキーマを定義する（まずは `links` のみ ent 化し、将来的に他テーブルも順次 ent に寄せていく）。
  - `model.Link` は外部向け DTO として残しつつ、永続化層では ent のエンティティを利用するように `handler/links.go` / `service` 層をリファクタリングする。
  - 既存の本番 Supabase DB を baseline とみなし、`api/ent/migrate/migrations/20251212121929_baseline.sql` を起点に Atlas versioned migrations を運用する。
  - 今後のスキーマ変更（例: `links.deleted_at` の追加や Index 追加）は Ent schema を唯一のソースオブトゥルースとして管理し、`api/ent/migrate/migrations/` で versioned migrations を管理する。
  - CI に ent のコード生成確認（`go generate ./...` 相当）と `go fmt ./...` を追加し、本番 Supabase に対するマイグレーション適用は専用コマンドで手動実行する運用を整える（自動 migrate は行わない）。

## M3.8.5: API 本番ホスティングの Render 移行 ✅

- **目的**: Railway トライアル終了に伴い、Go API を安定して動かせる本番ホスティング基盤に移行する。
- **ステータス**: 実装完了
- **やったこと**
  - API 側
    - Railway 上で動かしていた Go/Gin サーバーを Render の Web Service（Docker）に移行。
    - 既存の `api/Dockerfile` を Render 用にそのまま利用しつつ、コメントなどを Render ベースの記述に更新。
    - `ENVIRONMENT`, `DATABASE_URL`, `CLERK_SECRET_KEY`, `ALLOWED_ORIGINS` を Render の環境変数として設定。
    - CORS 設定を `ALLOWED_ORIGINS` 環境変数経由で制御するように変更し、本番ではホワイトリスト方式（開発環境では `AllowAllOrigins`）に統一。
  - Web 側
    - Vercel から Render 上の API に向けて通信するように `API_BASE_URL` / `NEXT_PUBLIC_API_BASE` などの環境変数を整理。
    - プライバシーポリシー（`web/src/app/privacy/page.tsx`）、アーキテクチャ（`documents/architecture.md`）、技術スタック（`documents/tech-stacks.md`）を Render ベースの構成に更新。
  - 拡張機能 側
    - `extension/src/storage.ts` の `DEFAULT_CONFIG.apiBaseUrl` を Render 本番 URL に更新し、新規インストール時のデフォルト接続先を Render に変更。
    - 既存の Options 画面からの API URL 設定フローは維持しつつ、Render 前提の運用に寄せた。
- **メモ**
  - 将来的にカスタムドメインやステージング環境を追加する場合も、`ALLOWED_ORIGINS` にドメインを追記するだけで CORS 設定を拡張できるようにしてある。
  - Railway での構成やデプロイ手順は、過去の履歴として `documents/deploy_m35_railway_vercel.md` に残している。

## M3.9: ルートページを紹介 LP 化

- **目的**: ルートを「価値が一目で伝わる紹介ページ」にする。
- **やること**
  - **構成策定**: ヒーロー（価値訴求＋主要 CTA）、機能一覧、使い方（拡張インストール → Web で認証 → リンク保存 → Web で閲覧）、実際に使っている様子（スクショ/動画）、フッター（CTA/問い合わせ）というシンプル構成でワイヤーを切る。
  - **トーン & UI 指針**: シンプルで余白のあるレイアウト＋強めのタイポとアクセントカラー。ヒーローは短いタグライン＋「リンク保存が秒で終わる」ビジュアル（ブラウザ拡張のモック）を置く。
  - **実装タスク**: `web/` 側で LP 用ページ（例: `src/app/about/page.tsx` を LP に、既存一覧は `src/app/page.tsx` などへ）を作成し、ヒーロー/機能/使い方/デモ/CTA セクションを組む。モック用スクショ or 簡易動画を用意。
  - **導線と計測**: LP の CTA からサインアップ/拡張インストール導線を配置。Clerk 認証や app 領域への遷移でデザインを崩さないよう共通ヘッダー/フッターを検討。主要 CTA にトラッキング（GA/Sentry 等）を付ける。

## M4: 検索・フィルタリング & タグ（使い勝手の向上） ✅

- **目的**: 溜まってきたリンクを「あとから探せる」状態にする。
- **ステータス**: 実装完了
- **やったこと**
  - API 側
    - `GET /api/links` にクエリパラメータ（`from`, `to`, `domain`, `tag` など）を追加
    - Supabase/Postgres のインデックスを調整（`user_id`, `saved_at`, `domain` など）
  - Web 側
    - リンク一覧ページにフィルタ UI（期間 / ドメイン / タグ）を追加し、日付期間などは URL クエリで表現（共有・再現性を高める）
    - クエリフォーマット例: `?from=2025-11-01&to=2025-11-30&tag=dev`（ISO8601 日付）。複数タグにする場合は `tag=dev&tag=ai` などの複数指定を許容。
  - タグ機能の基礎
    - 既存の `links.tags (text[])` を `jsonb` カラムに移行し、Ent 側では `field.JSON` を使った JSON フィールド（例: `[]string`）として管理するマイグレーションを追加する。
    - 将来的に必要になったら `tags` / `link_tags` テーブルに正規化して分離する。

## M4.1: リンク一覧のルート化 + フィルター UI 改善

- **目的**: リンク一覧の導線をシンプルにし、フィルター UI を「必要なときだけ開ける」形にして普段の閲覧を邪魔しないようにする。
- **やること**
  - Web 側
    - `src/app/page.tsx` をリンク一覧（フィルター付き）に置換し、`/links` ルートは廃止する（404）
    - フィルター UI をコンポーネント化し、折りたたみ（デフォルト閉） + アクティブ条件のバッジ表示を追加する
  - Docs
    - `src/app/about/page.tsx` の拡張機能案内を Chrome Web Store 導線に更新する
    - `documents/SETUP_Extension.md` を Chrome Web Store 前提の案内に更新する（開発者向け手順は必要に応じて残す）

## M4.2: 週次/月次クイックフィルター

- **目的**: `from/to` を手で入力しなくても「今週/先週/今月/先月」や過去の週/月に素早く絞り込めるようにする（URL 共有・再現性は維持）。
- **やること**
  - Web 側（`LinksFilterPanel`）
    - **期間プリセット**: `今週 / 先週 / 今月 / 先月` を 1 クリックで適用（内部的には `from/to` をセット）
    - **週次ナビゲーション**: `← / →` で週送り（過去/未来）できる UI を用意
      - **デフォルト**: 「今週」が選択状態（ただし既に URL に `from/to` がある場合はそれを優先）
    - **週の開始曜日**: **日曜始まり**で統一（感覚に合わせる）
      - 表示は日付レンジ（例: `2025-12-14〜2025-12-20`）を基本とし、「第 xx 週」のような表現は必須にしない
    - **月次の扱い**: 月も同様に `YYYY-MM` を軸に `from/to` を自動セット（例: `2025-12-01〜2025-12-31`）
    - **共有・再現性**: URL クエリに `from/to` を保持する（現状通り）

## M4.5: Web UI でリンクの更新・削除（memo）

- **目的**: 保存済みリンクのメモ（`note`）を Web から直接編集・削除できるようにする。
- **やること**
  - DB は既存の `note` を利用（スキーマ変更が必要なら `api/ent/migrate/migrations/` の Atlas versioned migrations で管理）
  - API: `PATCH /api/links/:id` で `note` を更新、`DELETE /api/links/:id` はハードデリート（将来は監査用にソフトデリート検討）
  - Web: リンク一覧（または詳細）でメモの編集 UI を用意し、削除アクションも提供

## M4.6: 拡張 UI でメモ付き保存

- **目的**: 拡張のポップアップから、メモを付けてリンクを保存できるようにする。
- **やること**
  - 拡張のポップアップに保存フォームを追加
    - URL: 現在タブを自動取得
    - メモ: 任意入力（`note`）
  - API 呼び出しは Web と共通の `POST /api/links` を利用し、Clerk JWT（Web から同期されたもの）で認証する
  - 拡張側に独立したサインイン UI は持たず、Web ログイン済みで同期されたトークンのみを使う

## M5: ダイジェスト生成の土台（手動トリガ）

- **目的**: とりあえず「ある期間のリンクをまとめたダイジェスト」を**手動で生成**でき、一覧/公開ページで閲覧できるようにする。
- **やること**
  - `digests` / `digest_items` テーブルを準備（必要ならマイグレーション追加）
  - API 側
    - `POST /api/digests/generate`（ユーザー・期間を指定してダイジェストを生成）
      - この段階では **手動 AI 要約** をここに含めて OK（Web からの手動実行のみ）
      - AI が失敗/タイムアウトした場合はテンプレベースにフォールバック（最低限生成は成功させる）
    - `GET /api/digests` / `GET /api/digests/:slug` などの基本的な取得 API
  - Web 側
    - `src/app/digests/page.tsx` … 自分のダイジェスト一覧
    - `src/app/digests/[slug].tsx` … 公開ダイジェスト表示ページ
  - 出力言語は **日本語固定**（入力リンクが英語でも要約は日本語）
  - AI 入力はなるべく多くの情報（title/url/domain/note/tags/description 等）を渡す方針。
    - ただしコンテキスト圧迫や応答速度が問題になったら「重要度順に削る」「リンク数が多い時は段階要約」などに切り替える。

## M6: AI 要約の磨き込み（自動ジョブなし）

- **目的**: M5 の手動 AI 要約を、品質/安定性/コスト面で「使える状態」にする（自動化はしない）。
- **やること**
  - プロンプト/テンプレの改善（リンクの並べ方、見出し構成、出典明示など）
  - 入力整形（title/url/note/tags/description 等を整理して渡す）
  - リンク数が多い場合の戦略（分割 → 要約 → 統合など）
  - 失敗時のフォールバックとログ（生成は落とさない）
  - コスト/レートのガード（ユーザーあたり回数や期間など）

## M7: 本番運用・安全性の強化

- **目的**: 他人に配っても安心して運用できる状態にする。
- **やること**
  - 認証 / 認可（M3.1 で Clerk 認証は実装済み）
    - Clerk の Organizations 機能を使った権限管理（必要に応じて）
    - API エンドポイントごとの認可ルール整備
  - セキュリティ
    - レートリミット
    - Clerk の JWT トークン検証の強化
  - モニタリング / ロギング
    - 主要エンドポイントのログ
    - エラー通知（Sentry 等）
  - デプロイパイプラインの自動化・強化
    - API / Web の CI / CD（既存の手動デプロイを自動化）
    - Supabase マイグレーションの適用フローを整備

## M7.5: アプリ領域を分離

- 目的: リンク一覧などのアプリ領域を分離して情報設計と導線を整理する。
- やること
  - **ルーティング/ドメイン案の整理**
    - **採用**: サブドメイン分離で進める。LP: `quicklinks-zeta.vercel.app` / アプリ: `app.quicklinks-zeta.vercel.app`。
      - DNS: `app.quicklinks-zeta.vercel.app` を `cname.vercel-dns.com` へ CNAME。Vercel 側でドメイン割り当て。
      - 環境変数: `NEXT_PUBLIC_SITE_ORIGIN`（LP）, `NEXT_PUBLIC_APP_ORIGIN`, `NEXT_PUBLIC_API_BASE`, API 側の `ALLOWED_ORIGINS` に両ドメインを登録。
      - Clerk: Allowed Origins/Redirect に両ドメイン追加。OAuth callback も両方登録。
      - ルーティング: LP は `src/app/page.tsx`、アプリは `src/app/links/page.tsx` などを `app.` サブドメインで出す。カノニカル URL をオリジンに合わせる。
    - パス分離案: `quicklinks-zeta.vercel.app`（LP） / `quicklinks-zeta.vercel.app/links`（アプリ）…サブドメイン採用のため今回は検討のみ。
    - SEO/Cookie/SameSite などの考慮は上記設定に含める。
  - **リンク共有 URL 設計（確定）**: `/u/<username>/links` でパス式に統一（人間可読・SEO 重視）。旧クエリ形は 301 リダイレクトで寄せる。
  - **将来検討（コミュニティ）**: `quicklinks-zeta.vercel.app/community` で全体公開リンクの最近分を見せる案は後続マイルストーンで追加検討（M3.9 範囲外）。
  - **デプロイ構成**: 同リポジトリ内で Next.js を 2 プロジェクトに分割して Vercel に 2 つ登録（LP: `/web`, アプリ: `/app`）。オリジン分離で CORS/Cookie/SameSite を明確化し、LP の SEO/マーケをルートドメインに集中させる。

## M8: 自動ジョブ & 通知（最終版）

- **目的**: 週次・月次ダイジェストが自動で溜まり、生成されたことに気づける（メール等で通知）状態にする。
- **やること**
  - ジョブキュー / バックグラウンドワーカー（必要な場合のみ）
    - `JOBS` テーブル or Redis キューを用意
    - `worker` パッケージでジョブ実行ロジックを実装
    - 「週次/月次ダイジェスト生成」「OG/メタデータ取得」などをジョブ化
  - スケジューリング（cron 相当）
  - 通知
    - 生成完了をメール等で通知（気づける導線）
