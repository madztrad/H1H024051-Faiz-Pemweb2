import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../api/layananAuth'
import { uraikanGalat } from '../api/penyesuai'
import { backendAktif } from '../api/konfigurasi'

export default function Login() {
  const [email, setEmail] = useState('')
  const [kataSandi, setKataSandi] = useState('')
  const [pesanGalat, setPesanGalat] = useState('')
  const [sedangMemuat, setSedangMemuat] = useState(false)

  const navigasi = useNavigate()

  async function tanganiKirim(peristiwa) {
    peristiwa.preventDefault()

    setPesanGalat('')
    setSedangMemuat(true)

    try {
      const hasil = await login(email, kataSandi)

      sessionStorage.setItem('token', hasil.token)
      sessionStorage.setItem('pengguna', JSON.stringify(hasil.pengguna))
      navigasi('/mahasiswa')
    } catch (galat) {
      setPesanGalat(uraikanGalat(galat).pesan)
    } finally {
      setSedangMemuat(false)
    }
  }

  return (
    <main className="halaman-login">
      <section className="panel-merek">
        <div className="lambang">S</div>
        <p className="label-kecil">Sistem Informasi Akademik</p>
        <h1>Kelola data mahasiswa dalam satu tempat.</h1>
        <p className="keterangan-merek">
          Praktikum Pemrograman Web II. Frontend React terhubung ke REST API
          melalui Axios, dengan pilihan backend Laravel atau Fiber.
        </p>
        <span className="lencana-backend">Backend aktif: {backendAktif}</span>
      </section>

      <section className="panel-form">
        <div className="kepala-form">
          <p className="label-kecil">Selamat datang</p>
          <h2>Masuk ke akun</h2>
          <p>Gunakan email dan kata sandi yang terdaftar pada backend.</p>
        </div>

        {pesanGalat && (
          <p className="kotak-galat" role="alert">
            {pesanGalat}
          </p>
        )}

        <form onSubmit={tanganiKirim} className="form-login">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="nama@unsoed.ac.id"
            value={email}
            onChange={(peristiwa) => setEmail(peristiwa.target.value)}
            required
          />

          <label htmlFor="kata-sandi">Kata sandi</label>
          <input
            id="kata-sandi"
            type="password"
            autoComplete="current-password"
            placeholder="Masukkan kata sandi"
            value={kataSandi}
            onChange={(peristiwa) => setKataSandi(peristiwa.target.value)}
            required
          />

          <button type="submit" className="tombol-utama" disabled={sedangMemuat}>
            {sedangMemuat ? 'Memproses...' : 'Masuk'}
          </button>
        </form>

        <p className="catatan-kaki">
          Token disimpan pada sessionStorage dan dikirim sebagai header
          Authorization.
        </p>
      </section>
    </main>
  )
}
