package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"

	"github.com/lvncer/quicklinks/api/internal/config"
	"github.com/lvncer/quicklinks/api/internal/db"
	"github.com/lvncer/quicklinks/api/internal/handler"
	"github.com/lvncer/quicklinks/api/internal/middleware"
	"github.com/lvncer/quicklinks/api/internal/repository"
)

func main() {
	// Load .env file (ignore error if not found)
	_ = godotenv.Load()

	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("failed to load config: %v", err)
	}

	// Initialize Clerk SDK
	middleware.InitClerk(cfg.ClerkSecretKey)

	// Create database connection pool (pgx)
	ctx := context.Background()
	pool, err := db.NewPool(ctx, cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("failed to create database pool: %v", err)
	}
	defer pool.Close()

	// Create Ent client for ORM operations.
	entClient, err := db.NewEntClient(cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("failed to create ent client: %v", err)
	}
	defer entClient.Close()

	// Set Gin mode based on environment
	if cfg.Environment == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	// Create Gin engine
	r := gin.Default()

	// Configure CORS
	corsConfig := cors.Config{
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}

	if cfg.Environment == "development" {
		corsConfig.AllowAllOrigins = true
	} else {
		corsConfig.AllowBrowserExtensions = true
		corsConfig.AllowOriginFunc = func(origin string) bool {
			if origin == "http://localhost:3000" ||
				origin == "https://localhost:3000" ||
				origin == "https://quicklinks-zeta.vercel.app" {
				return true
			}

			if strings.HasPrefix(origin, "chrome-extension://") {
				return true
			}

			return false
		}
	}

	r.Use(cors.New(corsConfig))

	// Health check endpoint (no auth required)
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	// Register handlers with auth middleware
	linkRepo := repository.NewLinkRepository(entClient)
	linksHandler := handler.NewLinksHandler(linkRepo)
	linksHandler.Register(r, middleware.ClerkAuth())

	// Create HTTP server
	srv := &http.Server{
		Addr:    ":" + cfg.Port,
		Handler: r,
	}

	// Start server in goroutine
	go func() {
		log.Printf("Starting server on port %s (environment: %s)", cfg.Port, cfg.Environment)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("listen: %s\n", err)
		}
	}()

	// Graceful shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Println("Shutting down server...")

	shutdownCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := srv.Shutdown(shutdownCtx); err != nil {
		log.Fatal("Server forced to shutdown:", err)
	}

	log.Println("Server exiting")
}
