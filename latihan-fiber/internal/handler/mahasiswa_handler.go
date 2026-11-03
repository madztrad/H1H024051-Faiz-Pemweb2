package handler

import (
	"cmp"
	"latihan-fiber/internal/model"
	"slices"
	"strconv"
	"strings"

	"github.com/gofiber/fiber/v3"
)

func DaftarMahasiswa(c fiber.Ctx) error {
	angkatan := c.Query("angkatan", "")
	urut := c.Query("urut", "")
	if urut != "" && urut != "nama" && urut != "ipk" {
		return fiber.NewError(fiber.StatusBadRequest, "Parameter urut harus nama atau ipk")
	}
	hasil := model.Daftar
	if angkatan != "" {
		nilaiAngkatan, err := strconv.Atoi(angkatan)
		if err != nil {
			return fiber.NewError(fiber.StatusBadRequest, "Parameter angkatan harus berupa angka")
		}
		hasil = []model.Mahasiswa{}
		for i := 0; i < len(model.Daftar); i++ {
			if model.Daftar[i].Angkatan == nilaiAngkatan {
				hasil = append(hasil, model.Daftar[i])
			}
		}
	}
	switch urut {
	case "nama":
		hasil = slices.SortedFunc(slices.Values(hasil), func(a, b model.Mahasiswa) int {
			return strings.Compare(a.Nama, b.Nama)
		})
	case "ipk":
		hasil = slices.SortedFunc(slices.Values(hasil), func(a, b model.Mahasiswa) int {
			return cmp.Compare(b.Ipk, a.Ipk)
		})
	}
	return c.JSON(fiber.Map{
		"sukses": true,
		"data":   hasil,
	})
}

func CariNim(c fiber.Ctx) error {
	nim := c.Params("nim")
	idx := slices.IndexFunc(model.Daftar, func(m model.Mahasiswa) bool {
		return m.Nim == nim
	})
	if idx == -1 {
		return fiber.NewError(fiber.StatusNotFound, "Mahasiswa tidak ditemukan")
	}
	return c.JSON(fiber.Map{
		"sukses": true,
		"data":   model.Daftar[idx],
	})
}
func DetailMahasiswa(c fiber.Ctx) error {
id, err := strconv.Atoi(c.Params("id"))
if err != nil {
return fiber.NewError(fiber.StatusBadRequest, "ID harus berupa angka")
}
for i := 0; i < len(model.Daftar); i++ {
if model.Daftar[i].ID == id {
return c.JSON(fiber.Map{
"sukses": true,
"data": model.Daftar[i],
})
}
}
return fiber.NewError(fiber.StatusNotFound, "Mahasiswa tidak ditemukan")
}