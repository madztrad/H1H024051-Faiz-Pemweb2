package model

import "time"

// TokenDaftarHitam menyimpan penanda token yang telah dicabut
// sebelum kedaluwarsa (logout). Kunci pencariannya adalah klaim jti.
type TokenDaftarHitam struct {
	ID         uint      `gorm:"primaryKey" json:"id"`
	Jti        string    `gorm:"size:64;uniqueIndex" json:"jti"`
	Kadaluarsa time.Time `json:"kadaluarsa"`
	CreatedAt  time.Time `json:"dibuat_pada"`
}
