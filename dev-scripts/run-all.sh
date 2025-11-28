#!/bin/bash

# QuickLinks 開発環境を一括起動するスクリプト
# APIサーバーとWebアプリを同時に起動します

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

API_DIR="$PROJECT_ROOT/api"
WEB_DIR="$PROJECT_ROOT/web"

# 色付きログ用
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 QuickLinks 開発環境を起動します...${NC}\n"

# APIサーバーの起動
echo -e "${GREEN}[1/2] APIサーバーを起動中...${NC}"
cd "$API_DIR"

# .envが存在するか確認
if [ ! -f .env ]; then
  if [ -f .env.example ]; then
    cp .env.example .env
    echo -e "${YELLOW}⚠️  api/.env を作成しました。SHARED_SECRET を設定してください。${NC}"
  else
    echo -e "${YELLOW}⚠️  api/.env.example が見つかりません${NC}"
  fi
fi

# バックグラウンドでAPIサーバーを起動
go run ./cmd/server > /tmp/quicklinks-api.log 2>&1 &
API_PID=$!

# APIサーバーの起動を待つ
echo -e "${BLUE}   APIサーバーの起動を待機中...${NC}"
sleep 3

# APIサーバーが起動しているか確認
if ! kill -0 $API_PID 2>/dev/null; then
  echo -e "${YELLOW}⚠️  APIサーバーの起動に失敗しました。ログを確認してください: /tmp/quicklinks-api.log${NC}"
  exit 1
fi

echo -e "${GREEN}   ✓ APIサーバーが起動しました (PID: $API_PID)${NC}"
echo -e "${BLUE}   → http://localhost:8080${NC}\n"

# Webアプリの起動
echo -e "${GREEN}[2/2] Webアプリを起動中...${NC}"
cd "$WEB_DIR"

# .env.localが存在するか確認
if [ ! -f .env.local ]; then
  if [ -f .env.local.example ]; then
    cp .env.local.example .env.local
    echo -e "${YELLOW}⚠️  web/.env.local を作成しました。API_BASE_URL と SHARED_SECRET を設定してください。${NC}"
  else
    echo -e "${YELLOW}⚠️  web/.env.local.example が見つかりません${NC}"
  fi
fi

# バックグラウンドでWebアプリを起動
bun run dev > /tmp/quicklinks-web.log 2>&1 &
WEB_PID=$!

# Webアプリの起動を待つ
echo -e "${BLUE}   Webアプリの起動を待機中...${NC}"
sleep 5

# Webアプリが起動しているか確認
if ! kill -0 $WEB_PID 2>/dev/null; then
  echo -e "${YELLOW}⚠️  Webアプリの起動に失敗しました。ログを確認してください: /tmp/quicklinks-web.log${NC}"
  kill $API_PID 2>/dev/null || true
  exit 1
fi

echo -e "${GREEN}   ✓ Webアプリが起動しました (PID: $WEB_PID)${NC}"
echo -e "${BLUE}   → http://localhost:3000${NC}\n"

echo -e "${GREEN}✨ すべてのサーバーが起動しました！${NC}\n"
echo -e "${YELLOW}ログ:${NC}"
echo -e "  API: tail -f /tmp/quicklinks-api.log"
echo -e "  Web: tail -f /tmp/quicklinks-web.log\n"
echo -e "${YELLOW}停止:${NC}"
echo -e "  ./dev-scripts/stop-all.sh を実行するか、Ctrl+C で停止できます\n"

# シグナルハンドリング（Ctrl+Cで両方停止）
trap "echo -e '\n${YELLOW}停止中...${NC}'; kill $API_PID $WEB_PID 2>/dev/null || true; exit" INT TERM

# プロセスが終了するまで待機
wait
