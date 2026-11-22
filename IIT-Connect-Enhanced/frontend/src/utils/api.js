import axios from 'axios'

// Keep API requests on the frontend's own origin in production.
// Vercel proxies /api to the backend, so auth cookies remain first-party
// in mobile browsers and Android WebView.
const API_BASE_URL = import.meta.env.PROD
  ? '/api'
  : `${(import.meta.env.VITE_API_URL || 'http://localhost:8080').replace(/\/$/, '')}/api`

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true
})

let refreshPromise = null

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    const status = error.response?.status
    const requestUrl = originalRequest?.url || ''
    const isAuthEndpoint = /\/auth\/(login|register|logout|refresh)/.test(requestUrl)

    // Retry a protected request once after refreshing the session.
    if (status !== 401 || !originalRequest || originalRequest._authRetry || isAuthEndpoint) {
      return Promise.reject(error)
    }

    originalRequest._authRetry = true

    try {
      if (!refreshPromise) {
        refreshPromise = api.post('/auth/refresh', null, { _skipAuthRefresh: true })
          .finally(() => { refreshPromise = null })
      }
      await refreshPromise
      return api(originalRequest)
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
