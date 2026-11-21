import React from 'react'
import { Link, Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, BookOpen, Globe2, Network, ShieldCheck, Users } from 'lucide-react'
import BrandSymbol from '../components/common/BrandSymbol'

export default function AuthLayout() {
  return (
    <main className="auth-shell min-h-screen overflow-hidden">
      <div className="auth-ambient"/>
      <div className="relative mx-auto grid min-h-screen max-w-7xl items-center gap-10 px-5 py-8 lg:grid-cols-[1.05fr_.95fr] lg:px-10">
        <section className="relative z-10 hidden lg:block">
          <Link to="/" className="inline-flex items-center gap-3"><BrandSymbol className="h-10 w-[76px] object-contain"/><span className="text-lg font-bold text-[#203927]">IIT<span className="text-[#719b42]">Connect</span></span></Link>
          <motion.div initial={{opacity:0,y:22}} animate={{opacity:1,y:0}} transition={{duration:.65}} className="mt-20 max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#719b42]/20 bg-[#719b42]/10 px-4 py-2 text-[10px] font-bold tracking-[.18em] text-[#527b42]"><Globe2 size={14}/> ONE COMMUNITY, MANY CAMPUSES</div>
            <h1 className="mt-7 text-6xl font-semibold leading-[1.03] tracking-[-.06em] text-[#203927]">Your next great connection could be <span className="auth-gradient">across campus.</span></h1>
            <p className="mt-6 max-w-lg text-base leading-8 text-[#69796d]">A trusted space for IIT students to connect, exchange knowledge and make campus life bigger.</p>
            <div className="mt-10 grid max-w-lg grid-cols-2 gap-3">
              {[[Users,'Student community'],[BookOpen,'Shared learning'],[ShieldCheck,'IIT email access'],[Globe2,'Across institutes']].map(([Icon,label])=><div key={label} className="flex items-center gap-3 rounded-xl border border-[#315d3e]/10 bg-white/65 p-3 text-xs font-semibold text-[#4c6251] shadow-sm"><Icon size={17} className="text-[#719b42]"/>{label}</div>)}
            </div>
          </motion.div>
          <div className="pointer-events-none absolute -bottom-28 -left-32 h-96 w-96 rounded-full bg-[#b9d889]/25 blur-3xl"/>
        </section>
        <section className="relative z-10 mx-auto w-full max-w-md">
          <div className="mb-7 flex items-center justify-between lg:hidden"><Link to="/" className="flex items-center gap-2 font-bold text-[#203927]"><BrandSymbol className="h-8 w-[60px] object-contain"/>IITStudentsOS</Link><Link to="/" className="text-xs text-[#718075]">Back to home</Link></div>
          <div className="auth-card rounded-[2rem] border border-[#315d3e]/10 bg-white/85 p-6 shadow-[0_30px_90px_rgba(43,68,42,.12)] backdrop-blur-xl sm:p-9">
            <Link to="/" className="mb-7 hidden items-center gap-2 text-xs font-semibold text-[#78877b] transition hover:text-[#315d3e] lg:inline-flex"><ArrowLeft size={14}/> Back to IITStudentsOS</Link>
            <Outlet/>
          </div>
          <p className="mt-5 text-center text-[11px] text-[#87948a]">Access is intended for verified IIT students.</p>
        </section>
      </div>
    </main>
  )
}
