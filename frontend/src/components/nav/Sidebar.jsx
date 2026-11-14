
import React from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

const linkBase = 'block px-3 py-2 rounded-xl text-sm transition-colors'

export default function Sidebar() {
  const { user } = useAuth()

  const links = [
    { to: '/app', label: 'Home' },
    { to: '/app/chat', label: 'Chat' },
    { to: '/app/gallery', label: 'Gallery' },
    { to: '/app/travel', label: 'Travel' },
    { to: '/app/placements', label: 'Placement Cell' },
    { to: '/app/events', label: 'Events' },
    { to: '/app/profile', label: 'Profile' }
  ]

  return (
    <aside className="hidden md:block w-72 border-r border-slate-900 min-h-screen bg-slate-950">
      <div className="p-4">
        <div className="text-lg font-semibold text-white">
          IIT Connect
        </div>

        <div className="mt-1 text-xs text-slate-400 truncate">
          {user?.email}
        </div>
      </div>

      <nav className="px-3 space-y-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/app'}
            className={({ isActive }) =>
              `${linkBase} ${
                isActive
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-300 hover:bg-slate-900'
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}

        {user?.role === 'admin' && (
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              `${linkBase} ${
                isActive
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-300 hover:bg-slate-900'
              }`
            }
          >
            Admin Dashboard
          </NavLink>
        )}
      </nav>
    </aside>
  )
}
