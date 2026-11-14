import React, { createContext, useEffect, useMemo, useState } from 'react'
import { io } from 'socket.io-client'

export const SocketContext = createContext(null)

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null)

  useEffect(() => {
    const s = io(API_URL, {
      withCredentials: true,
      transports: ['websocket']
    })
    setSocket(s)
    return () => {
      s.disconnect()
    }
  }, [])

  const value = useMemo(() => ({ socket }), [socket])
  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
}
