# Build stage
FROM golang:1.22 AS builder

WORKDIR /app

# Go modules を先にコピーして依存解決
COPY go.mod go.sum ./
RUN go mod download

# 残りのソースコードをコピー
COPY . .

# Linux 向けに静的バイナリをビルド
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o server ./cmd/server

# Runtime stage
FROM alpine:3.20

# 必要な CA 証明書とタイムゾーンだけ入れる
RUN apk add --no-cache ca-certificates tzdata

WORKDIR /app

# ビルド済みバイナリをコピー
COPY --from=builder /app/server /app/server

# アプリが待ち受けるポート（Railway が PORT を注入する）
EXPOSE 8080

# サーバー起動
CMD ["/app/server"]
