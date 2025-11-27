package config

import (
	"fmt"
	"os"
)

type Config struct {
	Port         string
	DatabaseURL  string
	SharedSecret string
	Environment  string
}

func Load() (*Config, error) {
	port := getenv("PORT", "8080")
	dbURL := os.Getenv("DATABASE_URL")
	secret := os.Getenv("SHARED_SECRET")
	env := getenv("ENVIRONMENT", "development")

	if dbURL == "" {
		return nil, fmt.Errorf("DATABASE_URL is required")
	}
	if secret == "" {
		return nil, fmt.Errorf("SHARED_SECRET is required")
	}

	return &Config{
		Port:         port,
		DatabaseURL:  dbURL,
		SharedSecret: secret,
		Environment:  env,
	}, nil
}

func getenv(key, def string) string {
	if v, ok := os.LookupEnv(key); ok {
		return v
	}
	return def
}
