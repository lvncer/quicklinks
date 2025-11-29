# QuickLinks Browser Extension

ブラウジング中に気になったリンクを、スマホの長押しや PC の右クリックから一瞬で保存できるブラウザ拡張機能です。

## 機能

- **スマホ（モバイル）**: リンクを長押しすると「Save」ボタンが表示されます
- **PC**: リンクを右クリックして「Save link to QuickLinks」を選択します
- 保存したリンクは QuickLinks API に送信され、データベースに保存されます

## セットアップ

### 1. 依存関係のインストール

```bash
bun install
```

### 2. ビルド

```bash
bun run build
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
