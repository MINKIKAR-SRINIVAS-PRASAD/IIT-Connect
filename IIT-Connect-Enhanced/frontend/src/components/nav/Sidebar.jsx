import React from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { Home, MessageCircle, BookOpen, Images, BriefcaseBusiness, CalendarDays, Compass, Plane, UserRound, ShieldCheck, Network } from 'lucide-react'

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
  const { user } = useAuth()
  const initials = (user?.profile?.name || user?.email || 'I').slice(0, 1).toUpperCase()
  return <>
    <aside className="dashboard-sidebar sticky top-0 hidden h-screen w-[258px] shrink-0 flex-col border-r border-white/[0.07] bg-[#090c19] px-4 py-5 md:flex">
      <Brand/>
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
    <nav className="mobile-bottom-nav fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-white/10 bg-[#090c19]/95 px-1 pb-[max(env(safe-area-inset-bottom),8px)] pt-2 backdrop-blur-xl md:hidden">
      {links.filter(({label}) => ['Home','Chat','Trip','Travel Home'].includes(label)).map(({to,label,icon:Icon,end}) => <NavLink key={to} to={to} end={end} className={({isActive}) => `flex min-w-0 flex-1 flex-col items-center gap-1 rounded-lg py-1.5 text-[9px] font-medium ${isActive ? 'text-indigo-200' : 'text-slate-500'}`}><Icon size={19}/><span>{label}</span></NavLink>)}
      <NavLink to="/app/profile" className={({isActive}) => `flex min-w-0 flex-1 flex-col items-center gap-1 rounded-lg py-1.5 text-[9px] font-medium ${isActive ? 'text-indigo-200' : 'text-slate-500'}`}><UserRound size={19}/><span>Profile</span></NavLink>
    </nav>
  </>
}
