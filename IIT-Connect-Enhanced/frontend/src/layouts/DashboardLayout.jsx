import React from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar from '../components/nav/Sidebar.jsx'
import Topbar from '../components/nav/Topbar.jsx'

export default function DashboardLayout() {
  const location = useLocation()
  return <div className="dashboard-shell min-h-screen bg-[#070914] text-slate-100">
    <div className="dashboard-atmosphere pointer-events-none fixed inset-0"/>
    <div className="relative flex min-h-screen">
      <Sidebar/>
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <Topbar/>
        <main className="relative flex-1 px-4 pb-24 pt-6 md:px-8 md:pb-10 md:pt-8">
          <div className="mx-auto w-full max-w-[1440px]">
            <AnimatePresence mode="wait">
              <motion.div key={location.pathname} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-6}} transition={{duration:.22,ease:'easeOut'}}>
                <Outlet/>
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
        <footer className="hidden border-t border-white/[0.05] px-8 py-4 text-[10px] tracking-wide text-slate-600 md:block">IITStudentsOS <span className="mx-2 text-slate-800">/</span> ONE COMMUNITY, MANY CAMPUSES</footer>
      </div>
    </div>
  </div>
}
