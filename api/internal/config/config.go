package config

import (
	"fmt"
	"os"
	"strings"
)

type Config struct {
	Port           string
	DatabaseURL    string
	ClerkSecretKey string
	Environment    string
	AllowedOrigins []string
}

func Load() (*Config, error) {
	port := getenv("PORT", "8080")
	dbURL := os.Getenv("DATABASE_URL")
	clerkSecret := os.Getenv("CLERK_SECRET_KEY")
	env := getenv("ENVIRONMENT", "development")
	origins := parseAllowedOrigins(os.Getenv("ALLOWED_ORIGINS"))

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
		AllowedOrigins: origins,
	}, nil
}

// parseAllowedOrigins parses a comma-separated ALLOWED_ORIGINS value into a slice.
// Empty or whitespace-only entries are ignored.
func parseAllowedOrigins(raw string) []string {
	if raw == "" {
		return nil
	}
	parts := strings.Split(raw, ",")
	res := make([]string, 0, len(parts))
	for _, p := range parts {
		v := strings.TrimSpace(p)
		if v == "" {
			continue
		}
		res = append(res, v)
	}
	return res
}

func getenv(key, def string) string {
	if v, ok := os.LookupEnv(key); ok {
		return v
	}
	return def
}
