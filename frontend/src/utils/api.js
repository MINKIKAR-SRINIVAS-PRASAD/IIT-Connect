import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true
})

export async function safeReq(promise) {
  try {
    const res = await promise
    return [null, res.data]
  } catch (e) {
    const msg = e?.response?.data?.message || e.message || 'Request failed'
    return [msg, null]
  }
}