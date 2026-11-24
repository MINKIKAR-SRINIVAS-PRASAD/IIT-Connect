import React, { createContext, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { api } from '../utils/api'
import { notifySuccessfulLogin, requestLoginNotificationPermission } from '../utils/loginNotification'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  async function fetchMe() {
    setLoading(true)
    try { const { data } = await api.get('/auth/me'); setUser(data.user); return data.user }
    catch { setUser(null); return null }
    finally { setLoading(false) }
  }
  useEffect(() => { fetchMe() }, [])
  const value = useMemo(() => ({
    user, loading, setUser, refresh: fetchMe,
    async login(email, password) {
      // Request permission within the user's login action, before the network await.
      await requestLoginNotificationPermission()
      const { data } = await api.post('/auth/login', { email, password }); setUser(data.user); void notifySuccessfulLogin(data.user); return data.user
    },
    async sendRegistrationOtp(email, password, accountType = 'student', facultyProfile = {}) {
      const { data } = await api.post('/auth/register/send-otp', { email, password, accountType, facultyProfile })
      return data
    },
    async verifyRegistrationOtp(email, otp) {
      const { data } = await api.post('/auth/register/verify-otp', { email, otp }); setUser(data.user); return data
    },
    async register(email, password) {
      const { data } = await api.post('/auth/register', { email, password }); setUser(data.user); toast.success('Account created'); return data.user
    },
    async logout() { await api.post('/auth/logout'); setUser(null); toast.success('Logged out') }
  }), [user, loading])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
