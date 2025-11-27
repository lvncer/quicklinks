package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"

	"github.com/lvncer/quicklinks/api/internal/config"
	"github.com/lvncer/quicklinks/api/internal/db"
	"github.com/lvncer/quicklinks/api/internal/handler"
)

func main() {
	godotenv.Load(".env")
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("failed to load config: %v", err)
	}

	ctx := context.Background()

	pool, err := db.NewPool(ctx, cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("failed to connect db: %v", err)
	}
	defer pool.Close()

	log.Println("database connection established successfully")

	r := gin.Default()

	// CORS 設定
	corsConfig := cors.DefaultConfig()
	if cfg.Environment == "production" {
		// 本番環境: localhost のみ許可
		corsConfig.AllowOrigins = []string{
			"http://localhost:3000",
			"http://localhost:8080",
			"https://localhost:3000",
			"https://localhost:8080",
		}
	} else {
		// 開発環境: 全許可
		corsConfig.AllowAllOrigins = true
	}
	corsConfig.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}
	corsConfig.AllowHeaders = []string{"Origin", "Content-Type", "Accept", "Authorization", "X-QuickLink-Secret"}
	corsConfig.AllowCredentials = true
	r.Use(cors.New(corsConfig))

	linksHandler := handler.NewLinksHandler(pool, cfg.SharedSecret)
	linksHandler.Register(r)

	srv := &http.Server{
		Addr:    ":" + cfg.Port,
		Handler: r,
	}

	go func() {
		log.Printf("starting server on :%s", cfg.Port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("listen: %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt)
	<-quit

	log.Println("shutting down server...")

	ctxShutDown, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctxShutDown); err != nil {
		log.Fatalf("server shutdown failed: %+v", err)
	}
	log.Println("server exited")
}
