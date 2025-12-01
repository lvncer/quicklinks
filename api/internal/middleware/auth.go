package middleware

import (
	"net/http"
	"strings"

	"github.com/clerk/clerk-sdk-go/v2"
	"github.com/clerk/clerk-sdk-go/v2/jwt"
	"github.com/gin-gonic/gin"
)

const (
	// ContextKeyUserID is the key used to store user_id in Gin context
	ContextKeyUserID = "user_id"
)

// ClerkAuth is a middleware that validates Clerk JWT tokens
func ClerkAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get Authorization header
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "missing authorization header"})
			c.Abort()
			return
		}

		// Extract Bearer token
		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || strings.ToLower(parts[0]) != "bearer" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid authorization header format"})
			c.Abort()
			return
		}
		token := parts[1]

		// Verify JWT token using Clerk SDK
		claims, err := jwt.Verify(c.Request.Context(), &jwt.VerifyParams{
			Token: token,
		})
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid token", "detail": err.Error()})
			c.Abort()
			return
		}

		// Extract user_id from claims (Subject is the user ID in Clerk)
		userID := claims.Subject
		if userID == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "user_id not found in token"})
			c.Abort()
			return
		}

		// Set user_id in context for handlers to use
		c.Set(ContextKeyUserID, userID)

		c.Next()
	}
}

// GetUserID retrieves the user_id from Gin context
func GetUserID(c *gin.Context) string {
	userID, exists := c.Get(ContextKeyUserID)
	if !exists {
		return ""
	}
	return userID.(string)
}

// InitClerk initializes the Clerk SDK with the secret key
func InitClerk(secretKey string) {
	clerk.SetKey(secretKey)
}
