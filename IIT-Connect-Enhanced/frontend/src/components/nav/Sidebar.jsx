import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { Home, MessageCircle, BookOpen, Images, BriefcaseBusiness, CalendarDays, Newspaper, Compass, Plane, UserRound, ShieldCheck, X, LogOut, Sparkles } from 'lucide-react'
import BrandSymbol from '../common/BrandSymbol'

const links = [
  { to: '/app', label: 'Home', icon: Home, end: true },
  { to: '/app/chat', label: 'Chat', icon: MessageCircle },
  { to: '/app/ai', label: 'IIT Connect AI', icon: Sparkles },
  { to: '/app/study', label: 'Study Hub', icon: BookOpen },
  { to: '/app/gallery', label: 'Gallery', icon: Images },
  { to: '/app/placements', label: 'Placements', icon: BriefcaseBusiness },
  { to: '/app/events', label: 'Events', icon: CalendarDays },
  { to: '/app/news', label: 'News', icon: Newspaper },
  { to: '/app/trip', label: 'Trip', icon: Compass },
  { to: '/app/travel-home', label: 'Travel Home', icon: Plane },
]

const facultyLinks = [
  { to: '/faculty/home', label: 'Faculty Home', icon: Home, end: true },
  { to: '/faculty/events', label: 'Events', icon: CalendarDays },
  { to: '/faculty/gallery', label: 'Gallery', icon: Images },
  { to: '/faculty/study', label: 'Study', icon: BookOpen },
  { to: '/faculty/publications', label: 'Publications', icon: BriefcaseBusiness },
  { to: '/faculty/travel', label: 'Travel', icon: Plane },
  { to: '/faculty/community', label: 'Chat & Community', icon: MessageCircle },
  { to: '/faculty/ai', label: 'IIT Connect AI', icon: Sparkles },
  { to: '/faculty/news', label: 'News', icon: Newspaper },
]

function Brand({ faculty = false }) {
  return <div className="flex items-center gap-3 px-2 py-2"><BrandSymbol className="h-9 w-[66px] shrink-0 object-contain"/><div><div className="text-sm font-bold tracking-tight text-white">{faculty ? 'IITProfessorsOS' : 'IITStudentsOS'}</div><div className="mt-0.5 text-[9px] font-semibold tracking-[.18em] text-slate-500">{faculty ? 'THE FACULTY NETWORK' : 'THE STUDENT NETWORK'}</div></div></div>
}

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const touchStart = useRef(null)
  const menuOpenRef = useRef(false)

  useEffect(() => { menuOpenRef.current = mobileMenuOpen }, [mobileMenuOpen])

  // Open from a rightward swipe that begins at the left screen edge;
  // close with a leftward swipe while the drawer is open.
  useEffect(() => {
    const onTouchStart = (event) => {
      if (window.innerWidth >= 768 || event.touches.length !== 1) return
      const touch = event.touches[0]
      touchStart.current = { x: touch.clientX, y: touch.clientY }
    }
    const onTouchEnd = (event) => {
      if (window.innerWidth >= 768 || !touchStart.current || event.changedTouches.length !== 1) return
      const start = touchStart.current
      const touch = event.changedTouches[0]
      const dx = touch.clientX - start.x
      const dy = touch.clientY - start.y
      touchStart.current = null
      if (Math.abs(dy) > 65 || Math.abs(dx) < 65) return
      if (!menuOpenRef.current && start.x <= 28 && dx > 0) setMobileMenuOpen(true)
      else if (menuOpenRef.current && dx < 0) setMobileMenuOpen(false)
    }
    const onTouchCancel = () => { touchStart.current = null }
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchend', onTouchEnd, { passive: true })
    window.addEventListener('touchcancel', onTouchCancel, { passive: true })
    return () => {
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchend', onTouchEnd)
      window.removeEventListener('touchcancel', onTouchCancel)
    }
  }, [])
  const isFaculty = user?.role === 'faculty'
  const activeLinks = isFaculty ? facultyLinks : links
  const displayName = isFaculty ? (user?.facultyProfile?.name || user?.email || 'Faculty') : (user?.profile?.name || user?.email || 'IIT Student')
  const displayInstitute = isFaculty ? (user?.facultyProfile?.institute || user?.email) : (user?.profile?.iit || user?.email)
  const initials = displayName.slice(0, 1).toUpperCase()
  return <>
    <aside className="dashboard-sidebar sticky top-0 hidden h-screen w-[258px] shrink-0 flex-col border-r border-white/[0.07] bg-[#090c19] px-4 py-5 md:flex">
      <div className="flex items-center justify-between md:block">
        <Brand faculty={isFaculty}/>
        <button type="button" aria-label={mobileMenuOpen ? 'Close page navigation' : 'Open page navigation'} aria-expanded={mobileMenuOpen} onClick={() => setMobileMenuOpen(value => !value)} className="mobile-menu-toggle ml-auto flex h-11 w-11 items-center justify-center rounded-2xl border border-[#a8c49a]/20 bg-[#a8c49a]/[0.06] text-[#c8d9bc] transition-colors hover:bg-[#a8c49a]/[0.12] md:hidden"><span className={`mobile-menu-icon ${mobileMenuOpen ? 'is-open' : ''}`} aria-hidden="true"><span/><span/><span/></span></button>
      </div>
      <div className="mt-9 px-3"><div className="text-[9px] font-bold tracking-[.2em] text-slate-600">WORKSPACE</div></div>
      <nav className="mt-3 flex-1 space-y-1">
        {activeLinks.map(({to,label,icon:Icon,end}) => <NavLink key={to} to={to} end={end} className={({isActive}) => `sidebar-link group flex items-center gap-3 rounded-xl px-3 py-3 text-[13px] font-medium transition-all duration-200 ${isActive ? 'sidebar-link-active text-white' : 'text-slate-400 hover:bg-white/[0.045] hover:text-slate-100'}`}><Icon size={17} strokeWidth={1.8} className="shrink-0 opacity-80"/><span>{label}</span>{(label === 'Chat' || label === 'Chat & Community') && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(103,232,249,.8)] opacity-0 group-hover:opacity-100"/>}</NavLink>)}
        {user?.role === 'admin' && <NavLink to="/admin" className={({isActive}) => `mt-5 flex items-center gap-3 rounded-xl border px-3 py-3 text-[13px] font-semibold transition ${isActive ? 'border-emerald-400/25 bg-emerald-400/10 text-emerald-200' : 'border-emerald-400/10 text-emerald-300/80 hover:bg-emerald-400/[0.06]'}`}><ShieldCheck size={17}/>Admin workspace</NavLink>}
      </nav>
      <NavLink to={isFaculty ? '/faculty/home' : '/app/profile'} className={({isActive}) => `group block rounded-2xl border p-3 transition-all ${isActive ? 'border-[#a8c49a]/35 bg-[#a8c49a]/10' : 'border-white/[0.07] bg-white/[0.025] hover:border-[#a8c49a]/30 hover:bg-[#a8c49a]/[0.06]'}`} title="Open your profile">
        <div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#78936c] to-[#a2bd91] text-sm font-bold text-[#111810]">{initials}</div><div className="min-w-0 flex-1"><div className="truncate text-xs font-semibold text-slate-200 group-hover:text-white">{displayName}</div><div className="mt-0.5 truncate text-[10px] text-slate-500">{displayInstitute}</div></div><UserRound size={15} className="shrink-0 text-slate-500 group-hover:text-[#c2d8ae]"/></div>
        <div className="mt-3 flex items-center gap-2 text-[9px] font-semibold tracking-[.12em] text-emerald-300/80"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400"/> CONNECTED COMMUNITY</div>
      </NavLink>
    </aside>
    <header className="mobile-brand-header fixed inset-x-0 top-0 z-40 flex items-center justify-between border-b border-white/10 bg-[#090c19]/95 px-4 py-2.5 backdrop-blur-xl md:hidden">
      <Brand faculty={isFaculty}/>
      <button type="button" aria-label={mobileMenuOpen ? 'Close page navigation' : 'Open page navigation'} aria-expanded={mobileMenuOpen} onClick={() => setMobileMenuOpen(value => !value)} className="mobile-menu-toggle flex h-11 w-11 items-center justify-center rounded-2xl border border-[#a8c49a]/20 bg-[#a8c49a]/[0.06] text-[#c8d9bc] transition-colors hover:bg-[#a8c49a]/[0.12] "><span className={`mobile-menu-icon ${mobileMenuOpen ? 'is-open' : ''}`} aria-hidden="true"><span/><span/><span/></span></button>
    </header>
    <AnimatePresence>
      {mobileMenuOpen && <motion.div className="mobile-nav-backdrop fixed inset-0 z-[100] flex justify-start bg-black/65 backdrop-blur-sm md:hidden" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={() => setMobileMenuOpen(false)}>
      <motion.section role="dialog" aria-modal="true" aria-label="Page navigation" className="mobile-nav-panel h-full w-[min(86vw,360px)] overflow-y-auto rounded-r-3xl border-r border-white/10 bg-[#111827] p-4 pb-[max(20px,env(safe-area-inset-bottom))] shadow-2xl" initial={{x:'-100%'}} animate={{x:0}} exit={{x:'-100%'}} transition={{type:'tween',duration:.24,ease:'easeOut'}} onClick={(event) => event.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between px-1"><div className="flex items-center gap-2"><BrandSymbol className="h-7 w-[54px] object-contain"/><div><div className="text-sm font-bold text-white">{isFaculty ? 'IITProfessorsOS' : 'IITStudentsOS'}</div><div className="mt-1 text-[10px] tracking-wider text-slate-400">{isFaculty ? 'FACULTY NAVIGATION' : 'NAVIGATE TO A PAGE'}</div></div></div><button type="button" aria-label="Close navigation" onClick={() => setMobileMenuOpen(false)} className="rounded-xl p-2 text-slate-400 hover:bg-white/5"><X size={20}/></button></div>
        <div className="grid grid-cols-2 gap-2">
          {activeLinks.map(({to,label,icon:Icon,end}) => <NavLink key={to} to={to} end={end} onClick={() => setMobileMenuOpen(false)} className={({isActive}) => `flex items-center gap-2.5 rounded-xl border px-3 py-3 text-sm ${isActive ? 'border-indigo-300/30 bg-indigo-300/10 text-indigo-100' : 'border-white/5 bg-white/[0.03] text-slate-300'}`}><Icon size={17}/><span>{label}</span></NavLink>)}
          <NavLink to={isFaculty ? '/faculty/home' : '/app/profile'} onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2.5 rounded-xl border border-white/5 bg-white/[0.03] px-3 py-3 text-sm text-slate-300"><UserRound size={17}/>{isFaculty ? 'Faculty profile' : 'Profile'}</NavLink>
          {user?.role === 'admin' && <NavLink to="/admin" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2.5 rounded-xl border border-emerald-400/15 bg-emerald-400/[0.05] px-3 py-3 text-sm text-emerald-200"><ShieldCheck size={17}/>Admin</NavLink>}
        </div>
        <button type="button" onClick={async () => { setMobileMenuOpen(false); try { await logout(); navigate('/login', { replace: true }) } catch { navigate('/login', { replace: true }) } }} className="mt-3 flex w-full items-center gap-2 rounded-xl border border-rose-400/15 bg-rose-400/[0.05] px-3 py-3 text-sm font-medium text-rose-200"><LogOut size={17}/>Sign out</button>
      </motion.section>
    </motion.div>}
    </AnimatePresence>
  </>
}
