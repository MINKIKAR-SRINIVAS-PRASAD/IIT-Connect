import React, { createContext, useEffect, useMemo, useState } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from '../hooks/useAuth'

export const SocketContext = createContext(null)

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

function canUseRealtime(user) {
  if (!user) return false
  if (user.role === 'admin') return true

  const profile = user.profile || {}
  return Boolean(
    profile.name?.trim() &&
    profile.iit?.trim() &&
    profile.branch?.trim() &&
    profile.batch?.trim() &&
    profile.photoUrl?.trim()
  )
}

export function SocketProvider({ children }) {
  const { user, loading } = useAuth()
  const [socket, setSocket] = useState(null)

  useEffect(() => {
    if (loading || !canUseRealtime(user)) {
      setSocket(null)
      return undefined
    }

    const s = io(API_URL, {
      withCredentials: true,
      transports: ['websocket']
    })
    setSocket(s)

    return () => {
      s.disconnect()
      setSocket((current) => current === s ? null : current)
    }
  }, [
    loading,
    user?.id,
    user?.role,
    user?.profile?.name,
    user?.profile?.iit,
    user?.profile?.branch,
    user?.profile?.batch,
    user?.profile?.photoUrl
  ])

  const value = useMemo(() => ({ socket }), [socket])
  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
}
