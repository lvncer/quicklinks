# QuickLinks Browser Extension

ブラウジング中に気になったリンクを、スマホの長押しや PC の右クリックから一瞬で保存できるブラウザ拡張機能です。

## 機能

- **スマホ（モバイル）**: リンクを長押しすると「Save」ボタンが表示されます
- **PC**: リンクを右クリックして「Save link to QuickLinks」を選択します
- 保存したリンクは QuickLinks API に送信され、データベースに保存されます

## セットアップ

### 1. 依存関係のインストール

```bash
cd extension
bun install
# または
npm install
```

### 2. ビルド

```bash
bun run build
# または
npm run build
```

開発中は watch モードも使えます：

```bash
bun run watch
```

### 3. Chrome にロード

1. Chrome で `chrome://extensions/` を開く
2. 右上の「デベロッパーモード」を有効にする
3. 「パッケージ化されていない拡張機能を読み込む」をクリック
4. `extension` フォルダを選択

### 4. 拡張機能の設定

1. Chrome の拡張機能アイコンをクリック
2. QuickLinks の「...」メニューから「オプション」を選択
3. 以下を設定:
   - **API Base URL**: QuickLinks API サーバーの URL（例: `http://localhost:8080`）
   - **Shared Secret**: API 認証用の共有シークレット（`.env` の `SHARED_SECRET` と同じ値）
4. 「Test」ボタンで接続を確認
5. 「Save」ボタンで設定を保存

## 開発

### ファイル構成

```
extension/
├── manifest.json          # Chrome 拡張機能マニフェスト (V3)
├── package.json           # Node.js 依存関係
├── tsconfig.json          # TypeScript 設定
├── options.html           # 設定ページ
├── src/
│   ├── background.ts      # Service Worker (コンテキストメニュー + API 呼び出し)
│   ├── content-script.ts  # 長押し検出 + Save ボタン表示
│   ├── options.ts         # 設定ページのロジック
│   ├── api.ts             # API クライアント
│   ├── storage.ts         # Chrome Storage ユーティリティ
│   └── ui/
│       └── toast.ts       # トースト通知
├── dist/                  # ビルド成果物
└── icons/                 # アイコン (要作成)
```

### アイコンの生成

Lucide アイコンから PNG アイコンを自動生成できます：

```bash
# デフォルト（link アイコン）
bun run generate-icons

# 別のアイコンを使用
bun run generate-icons bookmark
bun run generate-icons bookmark-plus
bun run generate-icons save
```

利用可能なアイコン例：
- `link` (デフォルト)
- `bookmark`
- `bookmark-plus`
- `save`
- `link-2`
- `book-open`
- `zap`
- `sparkles`

その他のアイコンは [Lucide Icons](https://lucide.dev/icons/) から選択できます。
アイコン名は kebab-case（例: `bookmark-plus`）で指定してください。

生成されるファイル：
- `icons/icon16.png` (16x16)
- `icons/icon48.png` (48x48)
- `icons/icon128.png` (128x128)

アイコンは紫のグラデーション背景に白いアイコンが表示されます。

## 使い方

### スマホ / タブレット

1. 任意のウェブページでリンクを**長押し**（約 0.5 秒）
2. 紫色の「💾 Save」ボタンが表示される
3. ボタンをタップしてリンクを保存
4. 「Link saved! ✨」のトーストが表示されれば成功

### PC

1. 任意のウェブページでリンクを**右クリック**
2. コンテキストメニューから「Save link to QuickLinks」を選択
3. 「Link saved!」のトーストが表示されれば成功

## トラブルシューティング

### 「Shared secret not configured」エラー

→ 拡張機能のオプションページで Shared Secret を設定してください。

### 「Connection failed」エラー

→ API サーバーが起動しているか確認してください。

### 「Authentication failed」エラー

→ Shared Secret が API サーバーの設定と一致しているか確認してください。

## 技術スタック

- **Chrome Extension Manifest V3**
- **TypeScript**
- **esbuild** (バンドラー)
- **Chrome Storage API** (設定保存)
- **Chrome Context Menus API** (右クリックメニュー)
