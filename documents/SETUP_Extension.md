# QuickLinks Browser Extension

ブラウジング中に気になったリンクを、スマホの長押しや PC の右クリックから一瞬で保存できるブラウザ拡張機能です。

## 機能

- **PC**: リンクを右クリックして「Save link to QuickLinks」を選択します
- 保存したリンクは QuickLinks API に送信され、データベースに保存されます

## セットアップ

### 1. リポジトリの取得

QuickLinks のソースコードをまだ取得していない場合は、次のコマンドで取得します。

```bash
git clone https://github.com/lvncer/quicklinks.git
```

### 2. 拡張機能のビルド（`dist/` の作成）

`manifest.json` から参照されるビルド済みスクリプトは `extension/dist/` に出力されます。
次のいずれかの方法で `dist/` ディレクトリを用意してください。

#### 2.1. 事前ビルド済み `dist/` をダウンロードする

[https://github.com/lvncer/quicklinks/tree/main/extension/dist](https://github.com/lvncer/quicklinks/tree/main/extension/dist) から `dist` ディレクトリをダウンロードし、ローカルの `quicklinks/extension/dist/` に配置します。

#### 2.2. ローカルでビルドする

1. `extension` ディレクトリに移動します：

   ```bash
   cd quicklinks/extension
   ```

2. 依存関係のインストールとビルドを実行します：

   ```bash
   bun install
   bun run build
   ```

> `bun` がインストールされていない場合は、[https://bun.sh/](https://bun.sh/) を参照してインストールしてください。

### 3. Chrome にロード

1. Chrome で `chrome://extensions/` を開く
2. 右上の「デベロッパーモード」を有効にする
3. 「パッケージ化されていない拡張機能を読み込む」をクリック
4. `quicklinks/extension` フォルダを選択

## 使い方

### PC

1. 任意のウェブページでリンクを**右クリック**
2. コンテキストメニューから「Save link to QuickLinks」を選択
3. 「Link saved!」のトーストが表示されれば成功
