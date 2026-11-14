import React, {
  createContext,
  useEffect,
  useMemo,
  useState
} from 'react'

import { io } from 'socket.io-client'
import { useAuth } from '../hooks/useAuth'

export const SocketContext = createContext(null)

const API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:8080'

export function SocketProvider({ children }) {
  const { user, loading } = useAuth()
  const [socket, setSocket] = useState(null)

  useEffect(() => {
    // Wait until authentication is completed
    if (loading || !user) {
      setSocket(null)
      return
    }

    const s = io(API_URL, {
      withCredentials: true,
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    })

    s.on('connect', () => {
      console.log('Socket connected:', s.id)
    })

    s.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message)
    })

    s.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason)
    })

    setSocket(s)

    return () => {
      s.disconnect()
      setSocket(null)
    }
  }, [user, loading])

  const value = useMemo(
    () => ({ socket }),
    [socket]
  )

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  )
}