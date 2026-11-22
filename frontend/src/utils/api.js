import axios from 'axios'

// Production uses same-origin /api so session cookies work reliably in Android WebView.
// Vercel rewrites /api/* to the backend; local development uses VITE_API_URL.
const API_BASE_URL = import.meta.env.PROD
  ? '/api'
  : `${(import.meta.env.VITE_API_URL || 'http://localhost:8080').replace(/\/$/, '')}/api`

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true
})

let refreshPromise = null

api.interceptors.response.use(
  response => response,
  async error => {
    const original = error.config
    const status = error.response?.status
    const authPath = /\/auth\/(login|register|logout|refresh)/.test(original?.url || '')

    if (status !== 401 || !original || original._authRetry || authPath) {
      return Promise.reject(error)
    }

    original._authRetry = true
    try {
      if (!refreshPromise) {
        refreshPromise = api.post('/auth/refresh')
          .finally(() => { refreshPromise = null })
      }
      await refreshPromise
      return api(original)
    } catch (refreshError) {
      return Promise.reject(refreshError)
    }
  }
)

export async function safeReq(promise) {
  try {
    const res = await promise
    return [null, res.data]
  } catch (e) {
    const msg = e?.response?.data?.message || e.message || 'Request failed'
    return [msg, null]
  }
}
