package auth

import (
	"crypto/rand"
	"encoding/hex"
	"errors"
	"strconv"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type Klaim struct {
	Peran string `json:"peran"`
	jwt.RegisteredClaims
}

// TerbitkanToken membuat token JWT HS256 berisi identitas pengguna.
// Klaim ID (jti) dipakai sebagai kunci pencabutan pada daftar hitam.
func TerbitkanToken(idPengguna uint, peran string, rahasia string, ttlMenit int) (string, error) {
	sekarang := time.Now()

	jti, err := jtiBaru()
	if err != nil {
		return "", err
	}

	klaim := Klaim{
		Peran: peran,
		RegisteredClaims: jwt.RegisteredClaims{
			ID:        jti,
			Subject:   strconv.FormatUint(uint64(idPengguna), 10),
			IssuedAt:  jwt.NewNumericDate(sekarang),
			ExpiresAt: jwt.NewNumericDate(sekarang.Add(time.Duration(ttlMenit) * time.Minute)),
			Issuer:    "pemweb2-fiber-api",
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, klaim)

	return token.SignedString([]byte(rahasia))
}

// PeriksaToken memverifikasi tanda tangan, metode penandatanganan,
// dan klaim token. Mengembalikan klaim bila token sah.
func PeriksaToken(nilaiToken string, rahasia string) (*Klaim, error) {
	token, err := jwt.ParseWithClaims(nilaiToken, &Klaim{}, func(t *jwt.Token) (any, error) {
		if _, cocok := t.Method.(*jwt.SigningMethodHMAC); cocok == false {
			return nil, errors.New("metode penandatanganan tidak didukung")
		}

		return []byte(rahasia), nil
	})

	if err != nil {
		return nil, err
	}

	klaim, cocok := token.Claims.(*Klaim)

	if cocok == false || token.Valid == false {
		return nil, errors.New("token tidak valid")
	}

	return klaim, nil
}

func jtiBaru() (string, error) {
	b := make([]byte, 16)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return hex.EncodeToString(b), nil
}
