#!/bin/bash
cd "$(dirname "$0")/../api"

# .envが存在するか確認
if [ ! -f .env ]; then
  if [ -f .env.example ]; then
    cp .env.example .env
    echo "Created api/.env from .env.example"
  else
    echo "Error: api/.env.example not found"
    exit 1
  fi
fi

# サーバー起動
echo "Starting API server on port 8080..."
go run ./cmd/server
