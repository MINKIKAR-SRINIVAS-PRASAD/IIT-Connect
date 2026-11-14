import React, { createContext, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { api } from '../utils/api'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  async function fetchMe() {
  setLoading(true)

  try {
    const { data } = await api.get('/auth/me')

    setUser(data.user)
    return data.user

  } catch {
    setUser(null)
    return null

  } finally {
    setLoading(false)
  }
}

  useEffect(() => {
    fetchMe()
  }, [])

  const value = useMemo(
    () => ({
      user,
      loading,
      setUser,
      refresh: fetchMe,
      async login(email, password) {
        const { data } = await api.post('/auth/login', { email, password })
        setUser(data.user)
        toast.success('Welcome back')
      },
      async register(email, password) {
        const { data } = await api.post('/auth/register', { email, password })
        setUser(data.user)
        toast.success('Account created')
      },
      async logout() {
        await api.post('/auth/logout')
        setUser(null)
        toast.success('Logged out')
      }
    }),
    [user, loading]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
