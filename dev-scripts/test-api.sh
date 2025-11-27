#!/bin/bash

# quicklinks API をテストするスクリプト
# api/.env から SHARED_SECRET を自動で読み込んで curl を実行

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
API_DIR="$PROJECT_ROOT/api"
ENV_FILE="$API_DIR/.env"

# .env ファイルの存在確認
if [ ! -f "$ENV_FILE" ]; then
  echo "Error: $ENV_FILE が見つかりません"
  echo "api/.env.example をコピーして api/.env を作成し、必要な環境変数を設定してください"
  exit 1
fi

# .env から SHARED_SECRET を読み込む
SHARED_SECRET=$(grep "^SHARED_SECRET=" "$ENV_FILE" | cut -d '=' -f2- | tr -d '"' | tr -d "'")

if [ -z "$SHARED_SECRET" ]; then
  echo "Error: $ENV_FILE に SHARED_SECRET が設定されていません"
  exit 1
fi

# API のベース URL（デフォルトは localhost:8080）
API_BASE="${1:-http://localhost:8080}"

echo "API テストを実行します..."
echo "API Base URL: $API_BASE"
echo ""

# テスト用のリクエストボディ
REQUEST_BODY=$(cat <<EOF
{
  "url": "https://example.com/article",
  "title": "Example Article",
  "page": "https://example.com",
  "note": "test from script",
  "user_identifier": "dev-user"
}
EOF
)

# curl で POST リクエストを送信
curl -X POST "$API_BASE/api/links" \
  -H "Content-Type: application/json" \
  -H "X-QuickLink-Secret: $SHARED_SECRET" \
  -d "$REQUEST_BODY" \
  -w "\n\nHTTP Status: %{http_code}\n" \
  -s

echo ""
