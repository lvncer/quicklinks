package config

import (
	"fmt"
	"os"
)

type Config struct {
	Port           string
	DatabaseURL    string
	ClerkSecretKey string
	Environment    string
}

func Load() (*Config, error) {
	port := getenv("PORT", "8080")
	dbURL := os.Getenv("DATABASE_URL")
	clerkSecret := os.Getenv("CLERK_SECRET_KEY")
	env := getenv("ENVIRONMENT", "development")

	if dbURL == "" {
		return nil, fmt.Errorf("DATABASE_URL is required")
	}
	if clerkSecret == "" {
		return nil, fmt.Errorf("CLERK_SECRET_KEY is required")
	}

	return &Config{
		Port:           port,
		DatabaseURL:    dbURL,
		ClerkSecretKey: clerkSecret,
		Environment:    env,
	}, nil
}

func getenv(key, def string) string {
	if v, ok := os.LookupEnv(key); ok {
		return v
	}
	return def
}
