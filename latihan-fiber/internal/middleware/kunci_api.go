package middleware

import (
	"os"

	"github.com/gofiber/fiber/v3"
)

func KunciApi() fiber.Handler {
	kunci := os.Getenv("API_KEY")
	return func(c fiber.Ctx) error {
		if c.Get("X-Api-Key") != kunci {
			return fiber.NewError(fiber.StatusUnauthorized, "API key tidak valid")
		}
		return c.Next()
	}
}
