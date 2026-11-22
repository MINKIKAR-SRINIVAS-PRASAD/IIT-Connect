import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { LogOut, ChevronRight } from 'lucide-react'

const labels = {
  '/faculty': 'Faculty Home', '/faculty/home': 'Faculty Home', '/faculty/events': 'Faculty Events', '/faculty/gallery': 'Faculty Gallery', '/faculty/study': 'Faculty Study', '/faculty/publications': 'Faculty Publications', '/faculty/travel': 'Faculty Travel', '/faculty/community': 'Faculty Community', '/faculty/news': 'Faculty News',
  '/app': 'Home',
  '/app/chat': 'Messages',
  '/app/study': 'Study Hub',
  '/app/gallery': 'Campus Gallery',
  '/app/placements': 'Placement Cell',
  '/app/events': 'Campus Events',
  '/app/trip': 'Trip',
  '/app/travel-home': 'Travel Home',
  '/app/travel': 'Travel Home',
  '/app/profile': 'Your Profile',
  '/admin': 'Admin Workspace'
}

export default function Topbar({ admin = false }) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const isFaculty = location.pathname.startsWith('/faculty')
  const title = labels[location.pathname] || (admin ? 'Admin Workspace' : isFaculty ? 'Faculty Network' : 'IITStudentsOS')
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const updateTransparency = () => {
      const progress = Math.min(window.scrollY / 180, 1)
      setScrollProgress(progress)
    }
    updateTransparency()
    window.addEventListener('scroll', updateTransparency, { passive: true })
    return () => window.removeEventListener('scroll', updateTransparency)
  }, [])

  const backgroundAlpha = 0.82 - scrollProgress * 0.52
  const borderAlpha = 0.07 - scrollProgress * 0.045
  const blurAmount = 24 - scrollProgress * 14

  return <header
    className="dashboard-topbar sticky top-0 z-30 border-b"
    style={{
      backgroundColor: `rgba(8, 11, 23, ${backgroundAlpha})`,
      borderBottomColor: `rgba(255, 255, 255, ${borderAlpha})`,
      backdropFilter: `blur(${blurAmount}px)`,
      WebkitBackdropFilter: `blur(${blurAmount}px)`,
      transition: 'background-color 120ms linear, border-color 120ms linear, backdrop-filter 120ms linear'
    }}
  >
    <div className="flex min-h-[70px] items-center justify-between gap-4 px-5 md:px-8">
      <div className="min-w-0"><div className="flex items-center gap-2 text-[10px] font-semibold tracking-[.16em] text-slate-600"><span>{isFaculty ? 'IIT CONNECT' : 'IITSTUDENTSOS'}</span><ChevronRight size={12}/><span className="truncate text-slate-400">{title.toUpperCase()}</span></div><div className="mt-1 flex items-center gap-2"><span className={`h-1.5 w-1.5 rounded-full ${admin ? 'bg-emerald-400' : 'bg-indigo-400'}`}/><span className="text-sm font-semibold text-slate-100">{title}</span></div></div>
      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2 rounded-full border border-white/[0.07] bg-white/[0.025] px-3 py-2 sm:flex"><span className="max-w-[150px] truncate text-xs text-slate-400">{(isFaculty ? user?.facultyProfile?.institute : user?.profile?.iit) || (isFaculty ? 'Faculty community' : 'IIT Community')}</span></div>
        <div className="hidden h-8 w-8 items-center justify-center rounded-full border border-indigo-300/20 bg-indigo-400/10 text-xs font-bold text-indigo-100 sm:flex">{(isFaculty ? user?.facultyProfile?.name : user?.profile?.name || user?.email || 'I').slice(0,1).toUpperCase()}</div>
        <button type="button" onClick={logout} className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2.5 text-xs font-semibold text-slate-300 transition hover:border-rose-300/30 hover:bg-rose-400/[0.06] hover:text-rose-200"><LogOut size={14}/><span className="hidden sm:inline">Sign out</span></button>
      </div>
    </div>
  </header>
}
