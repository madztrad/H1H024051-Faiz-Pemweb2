package handler

import (
	"strings"
	"time"

	"github.com/gofiber/fiber/v3"
	"golang.org/x/crypto/bcrypt"

	"latihan-fiber/internal/auth"
	"latihan-fiber/internal/config"
	"latihan-fiber/internal/model"
	"latihan-fiber/internal/validasi"
)

func Registrasi(c fiber.Ctx) error {
	var permintaan PermintaanRegistrasi

	err := c.Bind().Body(&permintaan)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "Format body tidak valid")
	}

	galat := validasi.Periksa(permintaan)
	if galat != nil {
		return c.Status(fiber.StatusUnprocessableEntity).JSON(fiber.Map{
			"sukses": false,
			"pesan":  "Data yang dikirim tidak valid",
			"galat":  galat,
		})
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(permintaan.KataSandi), bcrypt.DefaultCost)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "Gagal memproses kata sandi")
	}

	pengguna := model.Pengguna{
		Nama:      permintaan.Nama,
		Email:     permintaan.Email,
		KataSandi: string(hash),
		Peran:     "mahasiswa",
	}

	err = config.DB.Create(&pengguna).Error
	if err != nil {
		return fiber.NewError(fiber.StatusUnprocessableEntity, "Email sudah terdaftar")
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"sukses": true,
		"pesan":  "Registrasi berhasil",
		"data":   pengguna,
	})
}

func Login(c fiber.Ctx) error {
	var permintaan PermintaanLogin

	err := c.Bind().Body(&permintaan)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "Format body tidak valid")
	}

	galat := validasi.Periksa(permintaan)
	if galat != nil {
		return c.Status(fiber.StatusUnprocessableEntity).JSON(fiber.Map{
			"sukses": false,
			"pesan":  "Data yang dikirim tidak valid",
			"galat":  galat,
		})
	}

	var pengguna model.Pengguna

	err = config.DB.Where("email = ?", permintaan.Email).First(&pengguna).Error
	if err != nil {
		return fiber.NewError(fiber.StatusUnauthorized, "Email atau kata sandi tidak sesuai")
	}

	err = bcrypt.CompareHashAndPassword([]byte(pengguna.KataSandi), []byte(permintaan.KataSandi))
	if err != nil {
		return fiber.NewError(fiber.StatusUnauthorized, "Email atau kata sandi tidak sesuai")
	}

	konf := config.Muat()

	token, err := auth.TerbitkanToken(pengguna.ID, pengguna.Peran, konf.JwtSecret, konf.JwtTtlMenit)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "Gagal menerbitkan token")
	}

	return c.JSON(fiber.Map{
		"sukses": true,
		"pesan":  "Login berhasil",
		"data": fiber.Map{
			"pengguna": pengguna,
			"token":    token,
			"tipe":     "Bearer",
		},
	})
}

func Profil(c fiber.Ctx) error {
	idPengguna := c.Locals("id_pengguna")

	var pengguna model.Pengguna

	err := config.DB.First(&pengguna, idPengguna).Error
	if err != nil {
		return fiber.NewError(fiber.StatusNotFound, "Pengguna tidak ditemukan")
	}

	return c.JSON(fiber.Map{
		"sukses": true,
		"data":   pengguna,
	})
}

// Tugas praktikum no. 3: mencabut token sebelum kedaluwarsa
// dengan memasukkan klaim jti ke tabel daftar hitam.
func Logout(c fiber.Ctx) error {
	header := c.Get("Authorization")

	bagian := strings.Split(header, " ")
	if len(bagian) != 2 || bagian[0] != "Bearer" {
		return fiber.NewError(fiber.StatusUnauthorized, "Format header Authorization tidak sesuai")
	}

	konf := config.Muat()

	klaim, err := auth.PeriksaToken(bagian[1], konf.JwtSecret)
	if err != nil {
		return fiber.NewError(fiber.StatusUnauthorized, "Token tidak valid atau sudah kedaluwarsa")
	}

	if klaim.ID == "" {
		return fiber.NewError(fiber.StatusUnprocessableEntity, "Token tidak memiliki penanda, tidak dapat dicabut")
	}

	entri := model.TokenDaftarHitam{
		Jti:        klaim.ID,
		Kadaluarsa: klaim.ExpiresAt.Time,
	}

	if err := config.DB.Create(&entri).Error; err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "Gagal mencabut token")
	}

	return c.JSON(fiber.Map{
		"sukses": true,
		"pesan":  "Logout berhasil, token telah dicabut",
	})
}

// Tugas praktikum no. 1: menerbitkan token baru berdasarkan
// token yang masih berlaku pada header Authorization.
func Segarkan(c fiber.Ctx) error {
	idPengguna, cocokId := c.Locals("id_pengguna").(uint)
	peran, cocokPeran := c.Locals("peran").(string)

	if cocokId == false || cocokPeran == false {
		return fiber.NewError(fiber.StatusUnauthorized, "Konteks autentikasi tidak ditemukan")
	}

	konf := config.Muat()

	token, err := auth.TerbitkanToken(idPengguna, peran, konf.JwtSecret, konf.JwtTtlMenit)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "Gagal menerbitkan token")
	}

	return c.JSON(fiber.Map{
		"sukses": true,
		"pesan":  "Token berhasil diperbarui",
		"data": fiber.Map{
			"token":       token,
			"tipe":        "Bearer",
			"terbit_pada": time.Now().Format(time.RFC3339),
		},
	})
}
