# 変更履歴

このファイルは、プロジェクトの重要な変更をすべて記録します。

フォーマットは [Keep a Changelog](https://keepachangelog.com/ja/1.0.0/) に基づいており、
このプロジェクトは [Semantic Versioning](https://semver.org/lang/ja/) に準拠しています。

## 0.4.2.1

- Deleted

  - links テーブルから publised_at カラム を削除 ([#33](https://github.com/lvncer/quicklinks/pull/33))

## 0.3.9 - 2025-12-12

- Added

  - /about に LP を追加し、スクロール追従（進捗ベース）のアニメーションを導入（[#24](https://github.com/lvncer/quicklinks/pull/24)）

## 0.3.8.5 - 2025-12-10

- Changed

  - Railway から Render へのホスティング移行に伴うドキュメント全体の更新（[4215384](https://github.com/lvncer/quicklinks/commit/421538471d6506cb1e8806e9f65d6627dd9793a6)）
  - Railway から Render への API エンドポイント変更（[f30fdd7](https://github.com/lvncer/quicklinks/commit/f30fdd7e8a19e974deca5a858849d882619f5176)）
  - ALLOWED_ORIGINS 環境変数で CORS 許可オリジンを外部設定可能に（[e294466](https://github.com/lvncer/quicklinks/commit/e2944664ae8bb5b8ab2f911eeddb7ae92fb6a979)）

## 0.3.8 - 2025-12-10

- Added

  - Go API の ORM 導入（ent）（[#23](https://github.com/lvncer/quicklinks/pull/23)）

## 0.3.7 - 2025-12-06

- Added

  - Dependabot による bun install 時に--frozen-lockfile を無効化してロックファイル更新を許可（[0192130](https://github.com/lvncer/quicklinks/commit/0192130f707fc2148571917c81f33f32903d2104)）
  - 開発基盤の強化（Docker, CI, 依存関係）（[#9](https://github.com/lvncer/quicklinks/pull/9)）
