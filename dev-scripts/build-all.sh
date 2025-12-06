#!/bin/bash

# QuickLinks 全コンポーネントのクリーン & ビルド用スクリプト
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

API_DIR="$PROJECT_ROOT/api"
WEB_DIR="$PROJECT_ROOT/web"
EXT_DIR="$PROJECT_ROOT/extension"

echo "[1/3] Building API (Go) ..."
cd "$API_DIR"

go clean ./...
go fmt ./...
go test ./...
go build ./cmd/server

echo "[2/3] Building Web (Next.js) ..."
cd "$WEB_DIR"

# Install dependencies and build
if command -v bun >/dev/null 2>&1; then
  bun install
  bun run build
else
  npm install
  npm run build
fi

echo "[3/3] Building Extension ..."
cd "$EXT_DIR"

if command -v bun >/dev/null 2>&1; then
  bun install
  bun run build
else
  npm install
  npm run build
fi

echo "✅ All components built successfully"
