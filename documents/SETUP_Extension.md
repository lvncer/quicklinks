# QuickLinks Browser Extension

ブラウジング中に気になったリンクを、PC の右クリックから一瞬で保存できるブラウザ拡張機能です。

## インストール（推奨）

- Chrome Web Store: [QuickLinks](https://chromewebstore.google.com/detail/quicklinks/jofhehfnmliefoipncjbimmomenmegmj?authuser=0&hl=ja&pli=1)

1. 上のリンクを開く
2. 「Chrome に追加」をクリック
3. 権限を確認して追加

> 現在の対応ブラウザ: **PC の Google Chrome（デスクトップ）**

## 使い方（PC）

1. Web アプリにログイン（Clerk）
2. 任意のウェブページでリンクを**右クリック**
3. コンテキストメニューから「Save link to QuickLinks」を選択
4. 「Link saved!」のトーストが表示されれば成功

## 開発者向け（ローカルで読み込む）

Chrome Web Store を使わずに、ソースコードからローカル読み込みしたい場合の手順です。

### 1. リポジトリの取得

```bash
git clone https://github.com/lvncer/quicklinks.git
```

### 2. 拡張機能のビルド（`dist/` の作成）

`manifest.json` から参照されるビルド済みスクリプトは `extension/dist/` に出力されます。

```bash
cd quicklinks/extension
bun install
bun run build
```

> `bun` がインストールされていない場合は、[https://bun.sh/](https://bun.sh/) を参照してインストールしてください。

### 3. Chrome にロード（unpacked）

1. Chrome で `chrome://extensions/` を開く
2. 右上の「デベロッパーモード」を有効にする
3. 「パッケージ化されていない拡張機能を読み込む」をクリック
4. `quicklinks/extension` フォルダを選択
