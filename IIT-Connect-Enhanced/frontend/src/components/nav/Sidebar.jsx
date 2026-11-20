import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { Home, MessageCircle, BookOpen, Images, BriefcaseBusiness, CalendarDays, Compass, Plane, UserRound, ShieldCheck, Network, X, LogOut } from 'lucide-react'

const links = [
  { to: '/app', label: 'Home', icon: Home, end: true },
  { to: '/app/chat', label: 'Chat', icon: MessageCircle },
  { to: '/app/study', label: 'Study Hub', icon: BookOpen },
  { to: '/app/gallery', label: 'Gallery', icon: Images },
  { to: '/app/placements', label: 'Placements', icon: BriefcaseBusiness },
  { to: '/app/events', label: 'Events', icon: CalendarDays },
  { to: '/app/trip', label: 'Trip', icon: Compass },
  { to: '/app/travel-home', label: 'Travel Home', icon: Plane },
]

function Brand() {
  return <div className="flex items-center gap-3 px-2 py-2"><span className="brand-mark"><Network size={18}/></span><div><div className="text-sm font-bold tracking-tight text-white">IIT<span className="text-indigo-300">Connect</span></div><div className="mt-0.5 text-[9px] font-semibold tracking-[.18em] text-slate-500">THE STUDENT NETWORK</div></div></div>
}

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const initials = (user?.profile?.name || user?.email || 'I').slice(0, 1).toUpperCase()
  return <>
    <aside className="dashboard-sidebar sticky top-0 hidden h-screen w-[258px] shrink-0 flex-col border-r border-white/[0.07] bg-[#090c19] px-4 py-5 md:flex">
      <div className="flex items-center justify-between md:block">
        <Brand/>
        <button type="button" aria-label="Open page navigation" aria-expanded={mobileMenuOpen} onClick={() => setMobileMenuOpen(true)} className="ml-auto flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-300 md:hidden"><Network size={19}/></button>
      </div>
      <div className="mt-9 px-3"><div className="text-[9px] font-bold tracking-[.2em] text-slate-600">WORKSPACE</div></div>
      <nav className="mt-3 flex-1 space-y-1">
        {links.map(({to,label,icon:Icon,end}) => <NavLink key={to} to={to} end={end} className={({isActive}) => `sidebar-link group flex items-center gap-3 rounded-xl px-3 py-3 text-[13px] font-medium transition-all duration-200 ${isActive ? 'sidebar-link-active text-white' : 'text-slate-400 hover:bg-white/[0.045] hover:text-slate-100'}`}><Icon size={17} strokeWidth={1.8} className="shrink-0 opacity-80"/><span>{label}</span>{label === 'Chat' && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(103,232,249,.8)] opacity-0 group-hover:opacity-100"/>}</NavLink>)}
        {user?.role === 'admin' && <NavLink to="/admin" className={({isActive}) => `mt-5 flex items-center gap-3 rounded-xl border px-3 py-3 text-[13px] font-semibold transition ${isActive ? 'border-emerald-400/25 bg-emerald-400/10 text-emerald-200' : 'border-emerald-400/10 text-emerald-300/80 hover:bg-emerald-400/[0.06]'}`}><ShieldCheck size={17}/>Admin workspace</NavLink>}
      </nav>
      <NavLink to="/app/profile" className={({isActive}) => `group block rounded-2xl border p-3 transition-all ${isActive ? 'border-[#a8c49a]/35 bg-[#a8c49a]/10' : 'border-white/[0.07] bg-white/[0.025] hover:border-[#a8c49a]/30 hover:bg-[#a8c49a]/[0.06]'}`} title="Open your profile">
        <div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#78936c] to-[#a2bd91] text-sm font-bold text-[#111810]">{initials}</div><div className="min-w-0 flex-1"><div className="truncate text-xs font-semibold text-slate-200 group-hover:text-white">{user?.profile?.name || 'IIT Student'}</div><div className="mt-0.5 truncate text-[10px] text-slate-500">{user?.profile?.iit || user?.email}</div></div><UserRound size={15} className="shrink-0 text-slate-500 group-hover:text-[#c2d8ae]"/></div>
        <div className="mt-3 flex items-center gap-2 text-[9px] font-semibold tracking-[.12em] text-emerald-300/80"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400"/> CONNECTED COMMUNITY</div>
      </NavLink>
    </aside>
    <header className="mobile-brand-header fixed inset-x-0 top-0 z-40 flex items-center justify-between border-b border-white/10 bg-[#090c19]/95 px-4 py-2.5 backdrop-blur-xl md:hidden">
      <Brand/>
      <button type="button" aria-label="Open page navigation" aria-expanded={mobileMenuOpen} onClick={() => setMobileMenuOpen(true)} className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-300"><Network size={19}/></button>
    </header>
    {mobileMenuOpen && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/65 px-5 py-8 backdrop-blur-sm md:hidden" onClick={() => setMobileMenuOpen(false)}>
      <section role="dialog" aria-modal="true" aria-label="Page navigation" className="w-full max-w-sm rounded-3xl border border-white/10 bg-[#111827] p-4 shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between px-1"><div><div className="text-sm font-bold text-white">IIT<span className="text-indigo-300">Connect</span></div><div className="mt-1 text-[10px] tracking-wider text-slate-400">NAVIGATE TO A PAGE</div></div><button type="button" aria-label="Close navigation" onClick={() => setMobileMenuOpen(false)} className="rounded-xl p-2 text-slate-400 hover:bg-white/5"><X size={20}/></button></div>
        <div className="grid grid-cols-2 gap-2">
          {links.map(({to,label,icon:Icon,end}) => <NavLink key={to} to={to} end={end} onClick={() => setMobileMenuOpen(false)} className={({isActive}) => `flex items-center gap-2.5 rounded-xl border px-3 py-3 text-sm ${isActive ? 'border-indigo-300/30 bg-indigo-300/10 text-indigo-100' : 'border-white/5 bg-white/[0.03] text-slate-300'}`}><Icon size={17}/><span>{label}</span></NavLink>)}
          <NavLink to="/app/profile" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2.5 rounded-xl border border-white/5 bg-white/[0.03] px-3 py-3 text-sm text-slate-300"><UserRound size={17}/>Profile</NavLink>
          {user?.role === 'admin' && <NavLink to="/admin" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2.5 rounded-xl border border-emerald-400/15 bg-emerald-400/[0.05] px-3 py-3 text-sm text-emerald-200"><ShieldCheck size={17}/>Admin</NavLink>}
        </div>
        <button type="button" onClick={async () => { setMobileMenuOpen(false); try { await logout(); navigate('/login', { replace: true }) } catch { navigate('/login', { replace: true }) } }} className="mt-3 flex w-full items-center gap-2 rounded-xl border border-rose-400/15 bg-rose-400/[0.05] px-3 py-3 text-sm font-medium text-rose-200"><LogOut size={17}/>Sign out</button>
      </section>
    </div>}
  </>
}
