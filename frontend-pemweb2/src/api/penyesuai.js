import { backendAktif } from './konfigurasi'

// Setiap backend memiliki kontrak yang berbeda. Penyesuai menerjemahkan
// parameter permintaan dan menormalkan bentuk respons sehingga halaman tidak
// perlu tahu backend mana yang sedang dipakai.
const laravel = {
  nama: 'Laravel',

  parameterDaftar({ halaman, cari, perHalaman }) {
    return { page: halaman, cari: cari, per_halaman: perHalaman }
  },

  normalkanDaftar(data) {
    const meta = data.meta || {}

    return {
      daftar: data.data || [],
      meta: {
        halaman: meta.current_page || 1,
        totalHalaman: meta.last_page || 1,
        total: meta.total || 0,
      },
    }
  },

  payloadLogin(email, kataSandi) {
    return { email: email, password: kataSandi }
  },

  normalkanLogin(data) {
    return {
      token: data.data.token,
      pengguna: data.data.pengguna,
    }
  },

  normalkanGalat(data) {
    const galatField = {}
    const sumber = data.galat || data.errors || {}

    if (Array.isArray(sumber)) {
      sumber.forEach((item) => {
        galatField[item.field] = item.pesan
      })
    } else {
      Object.entries(sumber).forEach(([field, daftarPesan]) => {
        galatField[field] = Array.isArray(daftarPesan)
          ? daftarPesan[0]
          : String(daftarPesan)
      })
    }

    return {
      pesan: data.pesan || data.message || 'Data yang dikirim tidak valid',
      galatField: galatField,
    }
  },
}

const namaFieldFiber = {
  ProgramStudiID: 'program_studi_id',
  Nim: 'nim',
  Nama: 'nama',
  Email: 'email',
  Angkatan: 'angkatan',
  Ipk: 'ipk',
  Aktif: 'aktif',
  KataSandi: 'kata_sandi',
}

const fiber = {
  nama: 'Fiber',

  parameterDaftar({ halaman, cari, perHalaman }) {
    return { halaman: halaman, cari: cari, per_halaman: perHalaman }
  },

  normalkanDaftar(data) {
    const meta = data.meta || {}

    return {
      daftar: data.data || [],
      meta: {
        halaman: meta.halaman || 1,
        totalHalaman: meta.total_halaman || 1,
        total: meta.total || 0,
      },
    }
  },

  payloadLogin(email, kataSandi) {
    return { email: email, kata_sandi: kataSandi }
  },

  normalkanLogin(data) {
    return {
      token: data.data.token,
      pengguna: data.data.pengguna,
    }
  },

  normalkanGalat(data) {
    const galatField = {}

    ;(data.galat || []).forEach((item) => {
      const field = namaFieldFiber[item.field] || item.field.toLowerCase()
      galatField[field] = item.pesan
    })

    return {
      pesan: data.pesan || 'Data yang dikirim tidak valid',
      galatField: galatField,
    }
  },
}

export const penyesuai = backendAktif === 'fiber' ? fiber : laravel

export function uraikanGalat(galat) {
  if (!galat.response) {
    return { pesan: 'Tidak dapat menghubungi server', galatField: {} }
  }

  const hasil = penyesuai.normalkanGalat(galat.response.data || {})

  return {
    pesan: hasil.pesan || `Permintaan gagal (${galat.response.status})`,
    galatField: hasil.galatField,
  }
}
