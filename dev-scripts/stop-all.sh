#!/bin/bash

# QuickLinks 開発環境を停止するスクリプト

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}🛑 QuickLinks 開発環境を停止します...${NC}\n"

# APIサーバーを停止
API_PIDS=$(pgrep -f "go run ./cmd/server" || true)
if [ -n "$API_PIDS" ]; then
  echo -e "${GREEN}APIサーバーを停止中...${NC}"
  echo "$API_PIDS" | xargs kill 2>/dev/null || true
  sleep 1
  echo -e "${GREEN}✓ APIサーバーを停止しました${NC}"
else
  echo -e "${YELLOW}APIサーバーは実行されていません${NC}"
fi

# Webアプリを停止
WEB_PIDS=$(pgrep -f "bun run dev" | grep -v grep || true)
if [ -n "$WEB_PIDS" ]; then
  echo -e "${GREEN}Webアプリを停止中...${NC}"
  echo "$WEB_PIDS" | xargs kill 2>/dev/null || true
  sleep 1
  echo -e "${GREEN}✓ Webアプリを停止しました${NC}"
else
  echo -e "${YELLOW}Webアプリは実行されていません${NC}"
fi

# 強制停止（必要に応じて）
REMAINING=$(pgrep -f "quicklinks" || true)
if [ -n "$REMAINING" ]; then
  echo -e "${YELLOW}残存プロセスを強制停止中...${NC}"
  echo "$REMAINING" | xargs kill -9 2>/dev/null || true
fi

echo -e "\n${GREEN}✨ すべてのプロセスを停止しました${NC}"
