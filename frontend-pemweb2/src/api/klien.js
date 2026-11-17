import axios from 'axios'
import { baseURL } from './konfigurasi'

const klien = axios.create({
  baseURL: baseURL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  timeout: 10000,
})

klien.interceptors.request.use((konfigurasi) => {
  const token = sessionStorage.getItem('token')

  if (token) {
    konfigurasi.headers.Authorization = `Bearer ${token}`
  }

  return konfigurasi
})

klien.interceptors.response.use(
  (respons) => respons,
  (galat) => {
    const url = (galat.config && galat.config.url) || ''
    const sedangLogin = url.includes('/auth/login')
    const sudahDiHalamanLogin = window.location.pathname === '/login'

    // Login yang gagal juga berstatus 401. Pengalihan hanya dilakukan untuk
    // token kedaluwarsa agar pesan galat login tidak hilang karena muat ulang.
    if (galat.response && galat.response.status === 401 && !sedangLogin && !sudahDiHalamanLogin) {
      sessionStorage.removeItem('token')
      sessionStorage.removeItem('pengguna')
      window.location.href = '/login'
    }

    return Promise.reject(galat)
  },
)

export default klien
