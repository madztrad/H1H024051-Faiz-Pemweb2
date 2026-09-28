# Dokumentasi API Pemweb II (Modul 4)

`base_url = http://127.0.0.1:8000/api`. Seluruh permintaan wajib mengirim header
`Accept: application/json`. Tanpa header itu Laravel mengembalikan HTML saat galat.

Bentuk respons sukses mengikuti pola `{ "sukses": true, "pesan": ..., "data": ... }`,
kecuali endpoint koleksi berpaginasi yang memakai bungkus bawaan Laravel
(`data`, `links`, `meta`). Respons galat memakai pola
`{ "sukses": false, "pesan": ..., "galat": ... }` dengan status 404/422.

## 1. Status & Mahasiswa (langkah praktikum)

| Metode | URI | Parameter | Contoh Body | Contoh Respons |
|---|---|---|---|---|
| GET | `/status` | – | – | `200 { "sukses": true, "pesan": "API Pemweb II aktif", "waktu": "..." }` |
| GET | `/mahasiswa` | Query: `cari` (nama/nim), `angkatan`, `program_studi_id`, `urut` (`nama`,`nim`,`angkatan`,`ipk`), `arah` (`asc`,`desc`), `per_halaman` (maks 100), `fields` (lihat §4) | – | `200 { "data": [...], "links": {...}, "meta": {...} }` |
| GET | `/mahasiswa?angkatan=2023&per_halaman=5&urut=ipk&arah=desc` | – | – | `200` 5 data angkatan 2023 terurut ipk tertinggi |
| GET | `/mahasiswa?fields=nim,nama,ipk` | – | – | `200 { "data": [{ "nim": "H1A312234", "nama": "Darmaji Argono Sinaga", "ipk": 3.5 }] }` |
| POST | `/mahasiswa` | Body JSON (wajib: `program_studi_id`, `nim`, `nama`, `email`, `angkatan`; opsional: `ipk`, `aktif`) | `{ "program_studi_id": 1, "nim": "H1A125999", "nama": "Dewi Anggraini", "email": "dewi.anggraini@example.com", "angkatan": 2025, "ipk": 3.65 }` | `201 { "sukses": true, "pesan": "Data mahasiswa berhasil dibuat", "data": {...} }`. Body sama yang dikirim ulang → `422 { "sukses": false, "pesan": "Data yang dikirim tidak valid", "galat": { "nim": ["NIM tersebut sudah terdaftar"] } }` |
| GET | `/mahasiswa/{id}` | – | – | `200 { "sukses": true, "data": { "id": 1, "nim": "H1A312234", "nama": "Darmaji Argono Sinaga", "email": "zack.kris@example.com", "angkatan": 2023, "ipk": 3.5, "aktif": false, "program_studi": { "id": 1, "kode": "TK", "nama": "Teknik Komputer" }, "dibuat_pada": "..." } }`. Id tidak ada → `404 { "sukses": false, "pesan": "Sumber daya tidak ditemukan" }` |
| PUT/PATCH | `/mahasiswa/{id}` | Body JSON parsial, mis. `ipk` | `{ "ipk": 3.90 }` | `200 { "sukses": true, "pesan": "Data mahasiswa berhasil diperbarui", "data": {...} }` |
| DELETE | `/mahasiswa/{id}` | – | – | `200 { "sukses": true, "pesan": "Data mahasiswa berhasil dihapus" }` |

## 2. Matakuliah (Tugas 1)

| Metode | URI | Parameter | Contoh Body | Contoh Respons |
|---|---|---|---|---|
| GET | `/matakuliah` | Query: `cari` (nama/kode), `semester`, `sks`, `urut` (`nama`,`kode`,`sks`,`semester`), `arah`, `per_halaman` (maks 100) | – | `200 { "data": [...], "links": {...}, "meta": {...} }` |
| POST | `/matakuliah` | Body JSON (wajib: `kode` unik maks 10, `nama` maks 100, `sks` 1–6, `semester` 1–14) | `{ "kode": "IF401", "nama": "Pemrograman Web II", "sks": 3, "semester": 4 }` | `201 { "sukses": true, "pesan": "Data matakuliah berhasil dibuat", "data": { "id": 9, "kode": "IF401", "nama": "Pemrograman Web II", "sks": 3, "semester": 4, "dibuat_pada": "..." } }` |
| GET | `/matakuliah/{id}` | – | – | `200 { "sukses": true, "data": { "id": 1, "kode": "IF101", "nama": "Algoritma dan Pemrograman", "sks": 3, "semester": 1, "dibuat_pada": "..." } }` |
| PUT/PATCH | `/matakuliah/{id}` | Body JSON parsial (`kode` unik kecuali milik sendiri) | `{ "sks": 4 }` | `200 { "sukses": true, "pesan": "Data matakuliah berhasil diperbarui", "data": {...} }` |
| DELETE | `/matakuliah/{id}` | – | – | `200 { "sukses": true, "pesan": "Data matakuliah berhasil dihapus" }` |

## 3. Mahasiswa per Program Studi (Tugas 2)

| Metode | URI | Parameter | Contoh Respons |
|---|---|---|---|
| GET | `/program-studi/{id}/mahasiswa` | Query: `cari` (nama/nim), `per_halaman` (maks 100); terurut `nama` asc | `200 { "data": [{ "id": 1, "nim": "H1A312234", ..., "program_studi": { "id": 1, "kode": "TK", "nama": "Teknik Komputer" } }], "links": {...}, "meta": {...} }`. Id prodi tidak ada → `404 { "sukses": false, "pesan": "Sumber daya tidak ditemukan" }` |

## 4. Parameter `fields` (Tugas 3)

Berlaku di `GET /mahasiswa`, `GET /mahasiswa/{id}`, dan
`GET /program-studi/{id}/mahasiswa`. Nilai berupa daftar kolom dipisah koma:

```text
GET /mahasiswa?fields=nim,nama,ipk&per_halaman=2
```

Kolom yang diizinkan: `id`, `nim`, `nama`, `email`, `angkatan`, `ipk`, `aktif`,
`program_studi`, `dibuat_pada`. Kolom di luar daftar diabaikan; jika tidak ada
satu pun yang valid, seluruh kolom dikembalikan.

## 5. Koleksi Postman

Impor `Pemweb2-API.postman_collection.json` (sejajar dengan berkas ini) ke
Postman/Bruno. Ubah variabel `base_url` jika server tidak berjalan di
`http://127.0.0.1:8000/api`.
