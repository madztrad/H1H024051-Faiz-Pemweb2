package main

import (
	"errors"
	"latihan-fiber/internal/config"
	"latihan-fiber/internal/middleware"
	"latihan-fiber/internal/router"
	"log"

	"github.com/gofiber/fiber/v3"
	"github.com/gofiber/fiber/v3/middleware/cors"
	"github.com/gofiber/fiber/v3/middleware/logger"
	recoverer "github.com/gofiber/fiber/v3/middleware/recover"
	"github.com/gofiber/fiber/v3/middleware/requestid"
)

func main() {
	konf := config.Muat()

	config.HubungkanBasisData(konf)
	config.Migrasi()
	config.DataAwal()

	app := fiber.New(fiber.Config{
		AppName:      konf.NamaAplikasi,
		ErrorHandler: penanganGalat,
	})

	app.Use(requestid.New())
	app.Use(logger.New())
	app.Use(recoverer.New())
	app.Use(middleware.WaktuProses())
	app.Use(cors.New(cors.Config{
		AllowOrigins: []string{"http://localhost:5173"},
		AllowMethods: []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders: []string{"Origin", "Content-Type", "Accept", "Authorization"},
	}))

	router.Daftarkan(app)

	if err := app.Listen(":" + konf.Port); err != nil {
		log.Fatal(err)
	}
}

func penanganGalat(c fiber.Ctx, err error) error {
	kode := fiber.StatusInternalServerError
	pesan := "Terjadi kesalahan pada server"

	var galatFiber *fiber.Error
	if errors.As(err, &galatFiber) {
		kode = galatFiber.Code
		pesan = galatFiber.Message
	}

	// Langkah 13 modul 8: galat internal dicatat pada log server,
	// klien hanya menerima pesan umum agar informasi internal tidak bocor.
	if kode == fiber.StatusInternalServerError {
		log.Println("Galat internal:", err.Error())
	}

	return c.Status(kode).JSON(fiber.Map{
		"sukses": false,
		"pesan":  pesan,
	})
}
