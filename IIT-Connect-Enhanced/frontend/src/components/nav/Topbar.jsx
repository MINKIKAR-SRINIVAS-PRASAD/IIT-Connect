import React from 'react'
import Button from '../common/Button'
import { useAuth } from '../../hooks/useAuth'

export default function Topbar({ admin = false }) {
  const { user, logout } = useAuth()

  return (
    <header className="sticky top-0 z-10 border-b border-slate-900 bg-slate-950/80 backdrop-blur">
      <div className="px-4 md:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`h-2.5 w-2.5 rounded-full ${admin ? 'bg-emerald-400' : 'bg-indigo-400'}`} />
          <div className="font-semibold">{admin ? 'Admin Panel' : 'Dashboard'}</div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-sm text-slate-300 truncate max-w-[260px]">
            {user?.profile?.name ? user.profile.name : user?.email}
          </div>
          <Button variant="ghost" onClick={logout}>
            Logout
          </Button>
        </div>
      </div>
    </header>
  )
}
