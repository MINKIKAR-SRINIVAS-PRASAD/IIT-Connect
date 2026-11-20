import React from 'react'
import { NavLink } from 'react-router-dom'

const linkBase = 'block px-3 py-2 rounded-xl text-sm'

export default function AdminSidebar() {
  const links = [
    { to: '/admin', label: 'Overview' },
    { to: '/admin/users', label: 'Users' },
    { to: '/admin/approvals', label: 'Approvals' },
    { to: '/admin/analytics', label: 'Analytics' },
    { to: '/admin/deleted-content', label: 'Deleted Content' }
  ]

  return (
    <aside className="hidden md:block w-72 border-r border-slate-900 min-h-screen bg-slate-950">
      <div className="p-4">
        <div className="text-lg font-semibold">Admin</div>
        <div className="mt-1 text-xs text-slate-400">Moderation & stats</div>
      </div>
      <nav className="px-3 space-y-1">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.to === '/admin'}
            className={({ isActive }) =>
              `${linkBase} ${isActive ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-slate-900'}`
            }
          >
            {l.label}
          </NavLink>
        ))}
        <NavLink to="/app" className={`${linkBase} text-slate-300 hover:bg-slate-900`}>
          Back to App
        </NavLink>
      </nav>
    </aside>
  )
}
