import React, { useEffect, useRef, useState } from 'react'
import { useLocation, Outlet } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar from '../components/nav/Sidebar.jsx'
import Topbar from '../components/nav/Topbar.jsx'
import MobileCreatePost from '../components/common/MobileCreatePost.jsx'

export default function PortalShell({ children }) {
  const location = useLocation()
  const [createPostOpen, setCreatePostOpen] = useState(false)
  const touchOrigin = useRef(null)
  const gestureFired = useRef(false)

  useEffect(() => {
    if (window.matchMedia('(min-width: 768px)').matches) return
    const onStart = (event) => {
      if (event.touches.length !== 1) { touchOrigin.current = null; return }
      const touch = event.touches[0]
      if (touch.clientX > 30) { touchOrigin.current = null; return }
      touchOrigin.current = { x: touch.clientX, y: touch.clientY }
      gestureFired.current = false
    }
    const onMove = (event) => {
      if (!touchOrigin.current || gestureFired.current || event.touches.length !== 1) return
      const touch = event.touches[0]
      const dx = touch.clientX - touchOrigin.current.x
      const dy = touch.clientY - touchOrigin.current.y
      if (dx > 60 && Math.abs(dx) > Math.abs(dy) * 1.25) {
        gestureFired.current = true
        event.preventDefault()
        event.stopImmediatePropagation()
        setCreatePostOpen(true)
      }
    }
    const onEnd = () => { touchOrigin.current = null }
    window.addEventListener('touchstart', onStart, { capture: true, passive: true })
    window.addEventListener('touchmove', onMove, { capture: true, passive: false })
    window.addEventListener('touchend', onEnd, { capture: true, passive: true })
    window.addEventListener('touchcancel', onEnd, { capture: true, passive: true })
    return () => {
      window.removeEventListener('touchstart', onStart, true)
      window.removeEventListener('touchmove', onMove, true)
      window.removeEventListener('touchend', onEnd, true)
      window.removeEventListener('touchcancel', onEnd, true)
    }
  }, [])

  return <div className={`dashboard-shell min-h-screen ${location.pathname.startsWith('/faculty') ? 'faculty-theme' : ''} bg-[#070914] text-slate-100`}>
    <div className="dashboard-atmosphere pointer-events-none fixed inset-0"/>
    <div className="relative flex min-h-screen">
      <Sidebar/>
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <Topbar/>
        <main className="relative flex-1 px-4 pb-24 pt-6 md:px-8 md:pb-10 md:pt-8">
          <div className="mx-auto w-full max-w-[1440px]">
            <AnimatePresence mode="wait">
              <motion.div key={location.pathname} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-6}} transition={{duration:.22,ease:'easeOut'}}>
                {children ?? <Outlet/>}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
        <footer className="hidden border-t border-white/[0.05] px-8 py-4 text-[10px] tracking-wide text-slate-600 md:block">{location.pathname.startsWith('/faculty') ? 'IITProfessorsOS · FACULTY NETWORK' : 'IITSTUDENTSOS'} <span className="mx-2 text-slate-800">/</span> ONE COMMUNITY, MANY CAMPUSES</footer>
      </div>
    </div>
    {createPostOpen && <MobileCreatePost onClose={() => setCreatePostOpen(false)} />}
  </div>
}
