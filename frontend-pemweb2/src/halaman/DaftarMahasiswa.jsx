import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ambilDaftarMahasiswa,
  hapusMahasiswa,
  simpanMahasiswa,
} from '../api/layananMahasiswa'
import { logout } from '../api/layananAuth'
import { uraikanGalat } from '../api/penyesuai'
import { backendAktif } from '../api/konfigurasi'

const programStudi = [
  { id: 1, nama: 'Teknik Komputer' },
  { id: 2, nama: 'Informatika' },
  { id: 3, nama: 'Teknik Elektro' },
]

const formKosong = {
  nim: '',
  nama: '',
  email: '',
  angkatan: '',
  ipk: '',
  program_studi_id: '1',
  aktif: true,
}

function bacaPengguna() {
  try {
    return JSON.parse(sessionStorage.getItem('pengguna')) || null
  } catch {
    return null
  }
}

export default function DaftarMahasiswa() {
  const [daftar, setDaftar] = useState([])
  const [meta, setMeta] = useState(null)
  const [halaman, setHalaman] = useState(1)
  const [cari, setCari] = useState('')
  const [sedangMemuat, setSedangMemuat] = useState(false)
  const [pesanGalat, setPesanGalat] = useState('')
  const [versi, setVersi] = useState(0)

  const [formTerbuka, setFormTerbuka] = useState(false)
  const [form, setForm] = useState(formKosong)
  const [galatForm, setGalatForm] = useState({})
  const [pesanForm, setPesanForm] = useState('')
  const [sedangMenyimpan, setSedangMenyimpan] = useState(false)

  const [targetHapus, setTargetHapus] = useState(null)
  const [sedangMenghapus, setSedangMenghapus] = useState(false)

  const navigasi = useNavigate()
  const pengguna = bacaPengguna()

  useEffect(() => {
    let dibatalkan = false

    async function muatData() {
      setSedangMemuat(true)
      setPesanGalat('')

      try {
        const hasil = await ambilDaftarMahasiswa({
          halaman: halaman,
          cari: cari,
          perHalaman: 10,
        })

        if (dibatalkan === false) {
          setDaftar(hasil.daftar)
          setMeta(hasil.meta)
        }
      } catch (galat) {
        if (dibatalkan === false) {
          setPesanGalat(uraikanGalat(galat).pesan)
        }
      } finally {
        if (dibatalkan === false) {
          setSedangMemuat(false)
        }
      }
    }

    const penunda = setTimeout(muatData, 400)

    return () => {
      dibatalkan = true
      clearTimeout(penunda)
    }
  }, [halaman, cari, versi])

  function ubahForm(field, nilai) {
    setForm((sebelumnya) => ({ ...sebelumnya, [field]: nilai }))
    setGalatForm((sebelumnya) => ({ ...sebelumnya, [field]: undefined }))
  }

  function tutupForm() {
    setFormTerbuka(false)
    setForm(formKosong)
    setGalatForm({})
    setPesanForm('')
  }

  async function tanganiTambah(peristiwa) {
    peristiwa.preventDefault()

    setGalatForm({})
    setPesanForm('')
    setSedangMenyimpan(true)

    try {
      await simpanMahasiswa({
        nim: form.nim,
        nama: form.nama,
        email: form.email,
        angkatan: Number(form.angkatan),
        ipk: Number(form.ipk || 0),
        program_studi_id: Number(form.program_studi_id),
        aktif: form.aktif,
      })

      tutupForm()
      setHalaman(1)
      setVersi((nilai) => nilai + 1)
    } catch (galat) {
      const hasil = uraikanGalat(galat)
      setGalatForm(hasil.galatField)
      setPesanForm(hasil.pesan)
    } finally {
      setSedangMenyimpan(false)
    }
  }

  async function konfirmasiHapus() {
    if (!targetHapus) {
      return
    }

    setSedangMenghapus(true)
    setPesanGalat('')

    try {
      await hapusMahasiswa(targetHapus.id)
      setTargetHapus(null)

      if (daftar.length === 1 && halaman > 1) {
        setHalaman(halaman - 1)
      } else {
        setVersi((nilai) => nilai + 1)
      }
    } catch (galat) {
      setTargetHapus(null)
      setPesanGalat(uraikanGalat(galat).pesan)
    } finally {
      setSedangMenghapus(false)
    }
  }

  async function tanganiKeluar() {
    try {
      await logout()
    } catch {
      // Token mungkin sudah tidak berlaku; sesi lokal tetap dibersihkan.
    } finally {
      sessionStorage.removeItem('token')
      sessionStorage.removeItem('pengguna')
      navigasi('/login')
    }
  }

  return (
    <div className="tata-letak">
      <header className="bilah-atas">
        <div className="merek">
          <span className="lambang-kecil">S</span>
          <div>
            <strong>SIAKAD</strong>
            <small>Data mahasiswa</small>
          </div>
        </div>

        <div className="info-pengguna">
          <span className="lencana-backend">Backend: {backendAktif}</span>
          {pengguna && (
            <span className="identitas">
              {pengguna.nama} <small>{pengguna.peran}</small>
            </span>
          )}
          <button type="button" className="tombol-teks" onClick={tanganiKeluar}>
            Keluar
          </button>
        </div>
      </header>

      <main className="isi-halaman">
        <div className="kepala-halaman">
          <div>
            <p className="label-kecil">Direktori akademik</p>
            <h1>Daftar Mahasiswa</h1>
            <p className="keterangan">
              {meta ? `${meta.total} mahasiswa terdaftar` : 'Memuat ringkasan data'}
              {cari ? `, pencarian "${cari}"` : ''}
            </p>
          </div>

          <button
            type="button"
            className="tombol-utama"
            onClick={() => (formTerbuka ? tutupForm() : setFormTerbuka(true))}
          >
            {formTerbuka ? 'Tutup formulir' : '+ Tambah mahasiswa'}
          </button>
        </div>

        {formTerbuka && (
          <section className="kartu-form">
            <div className="kepala-kartu">
              <h2>Mahasiswa baru</h2>
              <p>Semua kolom wajib diisi kecuali IPK dan status aktif.</p>
            </div>

            {pesanForm && (
              <p className="kotak-galat" role="alert">
                {pesanForm}
              </p>
            )}

            <form className="form-mahasiswa" onSubmit={tanganiTambah} noValidate>
              <div className="kolom-form">
                <label htmlFor="nim">NIM</label>
                <input
                  id="nim"
                  placeholder="H1H024051"
                  value={form.nim}
                  onChange={(peristiwa) => ubahForm('nim', peristiwa.target.value)}
                />
                {galatForm.nim && <small className="galat-field">{galatForm.nim}</small>}
              </div>

              <div className="kolom-form">
                <label htmlFor="nama">Nama lengkap</label>
                <input
                  id="nama"
                  placeholder="Nama mahasiswa"
                  value={form.nama}
                  onChange={(peristiwa) => ubahForm('nama', peristiwa.target.value)}
                />
                {galatForm.nama && <small className="galat-field">{galatForm.nama}</small>}
              </div>

              <div className="kolom-form">
                <label htmlFor="email-mahasiswa">Email</label>
                <input
                  id="email-mahasiswa"
                  type="email"
                  placeholder="nama@mahasiswa.unsoed.ac.id"
                  value={form.email}
                  onChange={(peristiwa) => ubahForm('email', peristiwa.target.value)}
                />
                {galatForm.email && (
                  <small className="galat-field">{galatForm.email}</small>
                )}
              </div>

              <div className="kolom-form">
                <label htmlFor="program-studi">Program studi</label>
                <select
                  id="program-studi"
                  value={form.program_studi_id}
                  onChange={(peristiwa) =>
                    ubahForm('program_studi_id', peristiwa.target.value)
                  }
                >
                  {programStudi.map((prodi) => (
                    <option key={prodi.id} value={prodi.id}>
                      {prodi.nama}
                    </option>
                  ))}
                </select>
                {galatForm.program_studi_id && (
                  <small className="galat-field">{galatForm.program_studi_id}</small>
                )}
              </div>

              <div className="kolom-form">
                <label htmlFor="angkatan">Angkatan</label>
                <input
                  id="angkatan"
                  inputMode="numeric"
                  placeholder="2024"
                  value={form.angkatan}
                  onChange={(peristiwa) => ubahForm('angkatan', peristiwa.target.value)}
                />
                {galatForm.angkatan && (
                  <small className="galat-field">{galatForm.angkatan}</small>
                )}
              </div>

              <div className="kolom-form">
                <label htmlFor="ipk">IPK</label>
                <input
                  id="ipk"
                  inputMode="decimal"
                  placeholder="3.50"
                  value={form.ipk}
                  onChange={(peristiwa) => ubahForm('ipk', peristiwa.target.value)}
                />
                {galatForm.ipk && <small className="galat-field">{galatForm.ipk}</small>}
              </div>

              <div className="kolom-form kolom-penuh">
                <label className="pilihan-aktif">
                  <input
                    type="checkbox"
                    checked={form.aktif}
                    onChange={(peristiwa) => ubahForm('aktif', peristiwa.target.checked)}
                  />
                  Mahasiswa aktif
                </label>
              </div>

              <div className="aksi-form kolom-penuh">
                <button type="button" className="tombol-sekunder" onClick={tutupForm}>
                  Batal
                </button>
                <button type="submit" className="tombol-utama" disabled={sedangMenyimpan}>
                  {sedangMenyimpan ? 'Menyimpan...' : 'Simpan mahasiswa'}
                </button>
              </div>
            </form>
          </section>
        )}

        <section className="kartu-daftar">
          <div className="alat-daftar">
            <input
              type="search"
              className="kolom-cari"
              placeholder="Cari nama atau NIM"
              value={cari}
              onChange={(peristiwa) => {
                setHalaman(1)
                setCari(peristiwa.target.value)
              }}
            />
            <span className="status-muat">
              {sedangMemuat ? 'Memuat data...' : `${daftar.length} data pada halaman ini`}
            </span>
          </div>

          {pesanGalat && (
            <p className="kotak-galat" role="alert">
              {pesanGalat}
            </p>
          )}

          <div className="pembungkus-tabel">
            <table className="tabel-mahasiswa">
              <thead>
                <tr>
                  <th>NIM</th>
                  <th>Nama</th>
                  <th>Program studi</th>
                  <th>Angkatan</th>
                  <th className="rata-kanan">IPK</th>
                  <th>Status</th>
                  <th className="rata-kanan">Tindakan</th>
                </tr>
              </thead>
              <tbody>
                {daftar.map((mahasiswa) => (
                  <tr key={mahasiswa.id}>
                    <td className="mono">{mahasiswa.nim}</td>
                    <td>
                      <strong className="nama-mahasiswa">{mahasiswa.nama}</strong>
                      <small className="email-mahasiswa">{mahasiswa.email}</small>
                    </td>
                    <td>
                      {mahasiswa.program_studi?.nama ||
                        programStudi.find(
                          (prodi) => prodi.id === Number(mahasiswa.program_studi_id),
                        )?.nama ||
                        '-'}
                    </td>
                    <td>{mahasiswa.angkatan}</td>
                    <td className="rata-kanan mono">{Number(mahasiswa.ipk).toFixed(2)}</td>
                    <td>
                      <span className={mahasiswa.aktif ? 'pil pil-aktif' : 'pil'}>
                        {mahasiswa.aktif ? 'Aktif' : 'Tidak aktif'}
                      </span>
                    </td>
                    <td className="rata-kanan">
                      <button
                        type="button"
                        className="tombol-hapus"
                        onClick={() => setTargetHapus(mahasiswa)}
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {sedangMemuat === false && daftar.length === 0 && (
              <div className="keadaan-kosong">
                <p>Data tidak ditemukan.</p>
                <span>Ubah kata kunci pencarian atau tambahkan mahasiswa baru.</span>
              </div>
            )}
          </div>

          {meta && (
            <div className="kaki-tabel">
              <span>
                Halaman {meta.halaman} dari {meta.totalHalaman}
              </span>
              <div className="tombol-halaman">
                <button
                  type="button"
                  className="tombol-sekunder"
                  onClick={() => setHalaman(halaman - 1)}
                  disabled={halaman <= 1 || sedangMemuat}
                >
                  Sebelumnya
                </button>
                <button
                  type="button"
                  className="tombol-sekunder"
                  onClick={() => setHalaman(halaman + 1)}
                  disabled={meta.halaman >= meta.totalHalaman || sedangMemuat}
                >
                  Berikutnya
                </button>
              </div>
            </div>
          )}
        </section>
      </main>

      {targetHapus && (
        <div className="lapisan-modal" role="presentation">
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="judul-modal"
          >
            <h2 id="judul-modal">Hapus data mahasiswa?</h2>
            <p>
              Data <strong>{targetHapus.nama}</strong> dengan NIM{' '}
              <span className="mono">{targetHapus.nim}</span> akan dihapus permanen.
              Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="aksi-modal">
              <button
                type="button"
                className="tombol-sekunder"
                onClick={() => setTargetHapus(null)}
                disabled={sedangMenghapus}
              >
                Batal
              </button>
              <button
                type="button"
                className="tombol-bahaya"
                onClick={konfirmasiHapus}
                disabled={sedangMenghapus}
              >
                {sedangMenghapus ? 'Menghapus...' : 'Ya, hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
