const target = (import.meta.env.VITE_API_TARGET || 'laravel').toLowerCase()

const alamat = {
  laravel: import.meta.env.VITE_API_LARAVEL,
  fiber: import.meta.env.VITE_API_FIBER,
}

if (!alamat[target]) {
  throw new Error(
    `VITE_API_TARGET bernilai "${target}", padahal pilihan yang tersedia hanya laravel atau fiber.`,
  )
}

export const backendAktif = target
export const baseURL = alamat[target]
