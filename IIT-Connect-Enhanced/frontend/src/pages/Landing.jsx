import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import {
  ArrowDownRight, ArrowRight, ArrowUpRight, BookOpen, BriefcaseBusiness,
  CalendarDays, Check, Globe2, GraduationCap, Image as ImageIcon,
  Menu, MessageCircle, Network, ShieldCheck, Sparkles, Users, X, Compass
} from 'lucide-react'

const rise = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } }
}

const modules = [
  { icon: MessageCircle, number: '01', title: 'Real conversations', text: 'Meet people beyond your campus. Start a one-to-one conversation or join the shared IIT community.', tone: 'violet', tag: 'CONNECT' },
  { icon: BookOpen, number: '02', title: 'Knowledge travels', text: 'Exchange notes, useful links and study resources with students who are learning the same things.', tone: 'cyan', tag: 'LEARN' },
  { icon: BriefcaseBusiness, number: '03', title: 'Learn from the journey', text: 'Explore placement experiences, interview insights and practical advice shared by peers.', tone: 'amber', tag: 'GROW' },
  { icon: CalendarDays, number: '04', title: 'Make campus life bigger', text: 'Discover events, campus moments and travel plans from across the IIT network.', tone: 'rose', tag: 'EXPLORE' }
]

const institutes = ['IIT Bombay', 'IIT Delhi', 'IIT Madras', 'IIT Kanpur', 'IIT Kharagpur', 'IIT Bhubaneswar', 'IIT Hyderabad', 'IIT Guwahati']

function BrandSymbol({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 96 48" role="img" aria-label="IITStudentsOS">
      <defs>
        <linearGradient id="iit-connect-mark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#d6b987" />
          <stop offset="100%" stopColor="#a8c49a" />
        </linearGradient>
      </defs>
      <g fill="none" stroke="url(#iit-connect-mark)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 24h22M39 24l18-14M39 24l18 14M57 10h20M57 38h20" />
      </g>
      <g fill="#d6b987">
        <circle cx="17" cy="24" r="6" />
        <circle cx="39" cy="24" r="6" />
        <circle cx="57" cy="10" r="6" />
        <circle cx="57" cy="38" r="6" />
        <circle cx="77" cy="10" r="5" />
        <circle cx="77" cy="38" r="5" />
      </g>
    </svg>
  )
}

function Brand({ light = false }) {
  return <Link to="/" className="group inline-flex items-center gap-3" aria-label="IITStudentsOS home">
    <BrandSymbol className="h-9 w-[72px] object-contain"/>
    <span className={`text-[17px] font-bold tracking-tight ${light ? 'text-white' : 'text-white'}`}>IIT<span className="text-indigo-300">Connect</span></span>
  </Link>
}

function NavLink({ href, children }) {
  return <a href={href} className="text-sm text-slate-400 transition hover:text-white">{children}</a>
}

function OrbitVisual({ reduceMotion }) {
  const nodes = [
    { label: 'IIT BOMBAY', x: '7%', y: '23%', delay: 0.2 },
    { label: 'IIT DELHI', x: '69%', y: '9%', delay: 0.5 },
    { label: 'IIT MADRAS', x: '77%', y: '67%', delay: 0.8 },
    { label: 'IIT BHUBANESWAR', x: '9%', y: '73%', delay: 1.1 },
    { label: 'IIT KANPUR', x: '42%', y: '2%', delay: 1.4 }
  ]
  return <div className="network-stage relative mx-auto h-[410px] w-full max-w-[570px] md:h-[500px]">
    <div className="network-grid absolute inset-0 rounded-[2rem]" />
    <motion.div className="orbit orbit-one" animate={reduceMotion ? {} : { rotate: 360 }} transition={{ duration: 48, repeat: Infinity, ease: 'linear' }} />
    <motion.div className="orbit orbit-two" animate={reduceMotion ? {} : { rotate: -360 }} transition={{ duration: 62, repeat: Infinity, ease: 'linear' }} />
    <div className="orbit-core absolute left-1/2 top-1/2 z-10 flex h-36 w-36 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full md:h-44 md:w-44">
      <BrandSymbol className="mb-2 h-9 w-[78px] object-contain"/>
      <div className="text-center text-sm font-bold tracking-wide text-white">ONE IIT<br/>COMMUNITY</div>
      <div className="mt-1 text-[9px] tracking-[0.2em] text-indigo-200/60">CONNECTED</div>
    </div>
    {nodes.map((node, i) => <motion.div key={node.label} className="absolute z-20" style={{ left: node.x, top: node.y }} initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1, y: reduceMotion ? 0 : [0, -7, 0] }} transition={{ opacity: { delay: node.delay, duration: 0.5 }, scale: { delay: node.delay, type: 'spring' }, y: { delay: node.delay, duration: 4 + i * 0.4, repeat: Infinity, ease: 'easeInOut' } }}>
      <div className="rounded-xl border border-white/10 bg-slate-900/85 px-3 py-2 shadow-xl shadow-black/30 backdrop-blur-xl">
        <div className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(103,232,249,.9)]"/><span className="text-[9px] font-semibold tracking-[0.12em] text-slate-200 md:text-[10px]">{node.label}</span></div>
      </div>
    </motion.div>)}
    <motion.div className="absolute bottom-[9%] right-[4%] z-30 w-44 rounded-2xl border border-white/10 bg-slate-900/90 p-4 shadow-2xl shadow-indigo-950/50 backdrop-blur-xl md:w-52" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.1, duration: 0.7 }}>
      <div className="flex items-center gap-2 text-xs font-semibold text-white"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-400/10 text-emerald-300"><Users size={15}/></span>Beyond campus walls</div>
      <p className="mt-2 text-[11px] leading-5 text-slate-400">Ideas, experiences and opportunities move freely between institutes.</p>
    </motion.div>
    <div className="absolute left-[4%] top-[43%] z-20 rounded-full border border-indigo-300/15 bg-indigo-400/10 px-3 py-1.5 text-[9px] font-semibold tracking-[0.18em] text-indigo-200">INDIA • ONE NETWORK</div>
  </div>
}

export default function Landing() {
  const [menuOpen, setMenuOpen] = useState(false)
  const reduceMotion = useReducedMotion()
  return <main className="landing-shell min-h-screen overflow-hidden bg-[#070914] text-white">
    <div className="landing-ambient" aria-hidden="true"><div className="ambient-glow ambient-glow-a"/><div className="ambient-glow ambient-glow-b"/></div>
    <header className="landing-nav sticky top-0 z-50 border-b border-white/[0.07] bg-[#070914]/75 backdrop-blur-2xl">
      <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 md:px-8">
        <Brand/>
        <nav className="hidden items-center gap-9 md:flex"><NavLink href="#community">Community</NavLink><NavLink href="#platform">Platform</NavLink><NavLink href="#mission">Our mission</NavLink></nav>
        <div className="hidden items-center gap-3 md:flex"><Link to="/login" className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-white/[0.06] hover:text-white">Sign in</Link><Link to="/register" className="btn-primary inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold">Join the network <ArrowUpRight size={16}/></Link></div>
        <button type="button" onClick={() => setMenuOpen(!menuOpen)} className="rounded-xl border border-white/10 p-2.5 text-slate-200 md:hidden" aria-label="Toggle navigation">{menuOpen ? <X size={20}/> : <Menu size={20}/>}</button>
      </div>
      {menuOpen && <div className="border-t border-white/10 bg-[#0b0e1b] px-5 py-5 md:hidden"><div className="flex flex-col gap-4"><a onClick={() => setMenuOpen(false)} href="#community" className="text-sm text-slate-300">Community</a><a onClick={() => setMenuOpen(false)} href="#platform" className="text-sm text-slate-300">Platform</a><a onClick={() => setMenuOpen(false)} href="#mission" className="text-sm text-slate-300">Our mission</a><div className="flex gap-3 pt-2"><Link to="/login" className="flex-1 rounded-xl border border-white/10 py-3 text-center text-sm">Sign in</Link><Link to="/register" className="btn-primary flex-1 rounded-xl py-3 text-center text-sm font-bold">Join IITStudentsOS</Link></div></div></div>}
    </header>

    <section className="relative z-10 mx-auto grid min-h-[calc(100svh-76px)] max-w-7xl items-center gap-5 px-5 pb-16 pt-14 md:grid-cols-[1.02fr_.98fr] md:px-8 md:pb-20 md:pt-10">
      <motion.div initial="hidden" animate="visible" variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.12, delayChildren: 0.12 } } }} className="relative z-20">
        <motion.div variants={rise} className="mb-7 inline-flex items-center gap-2 rounded-full border border-indigo-300/20 bg-indigo-300/[0.07] px-4 py-2 text-[11px] font-semibold tracking-[0.16em] text-indigo-200"><Sparkles size={14}/> BUILT FOR THE IIT COMMUNITY <span className="ml-1 h-1.5 w-1.5 rounded-full bg-emerald-300"/></motion.div>
        <motion.h1 variants={rise} className="max-w-3xl text-[clamp(3.5rem,7.3vw,6.8rem)] font-semibold leading-[.98] tracking-[-0.065em] text-white">Your campus<br/>is just the <span className="hero-gradient-text">beginning.</span></motion.h1>
        <motion.p variants={rise} className="mt-7 max-w-xl text-base leading-8 text-slate-400 md:text-lg">A shared space for IIT students to meet, exchange ideas, discover opportunities and build friendships that reach far beyond one campus.</motion.p>
        <motion.div variants={rise} className="mt-9 flex flex-wrap items-center gap-3"><Link to="/register" className="btn-primary inline-flex items-center gap-3 rounded-xl px-6 py-4 text-sm font-bold">Become part of it <ArrowUpRight size={17}/></Link><a href="#platform" className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-6 py-4 text-sm font-semibold text-slate-200 transition hover:border-white/25 hover:bg-white/[0.04]">Explore the platform <ArrowDownRight size={16}/></a></motion.div>
        <motion.div variants={rise} className="mt-12 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-white/[0.08] pt-6 text-xs text-slate-500"><span className="inline-flex items-center gap-2"><ShieldCheck size={15} className="text-emerald-300"/> IIT-email based access</span><span className="inline-flex items-center gap-2"><Globe2 size={15} className="text-indigo-300"/> Across institutes</span><span className="inline-flex items-center gap-2"><Users size={15} className="text-cyan-300"/> Student community</span></motion.div>
      </motion.div>
      <motion.div initial={{ opacity: 0, scale: 0.92, x: 30 }} animate={{ opacity: 1, scale: 1, x: 0 }} transition={{ duration: 1, delay: 0.25, ease: [0.22, 1, 0.36, 1] }} className="relative z-10 -mx-3 mt-3 md:mx-0 md:mt-0"><OrbitVisual reduceMotion={reduceMotion}/></motion.div>
      <div className="pointer-events-none absolute bottom-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-indigo-300/20 to-transparent"/>
    </section>

    <section id="community" className="relative z-10 border-y border-white/[0.07] bg-white/[0.018]">
      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 md:grid-cols-[.8fr_1.2fr] md:items-center md:px-8">
        <div><div className="text-[10px] font-bold tracking-[0.22em] text-indigo-300">THE BIGGER PICTURE</div><p className="mt-2 text-xl font-medium tracking-tight text-white md:text-2xl">One student community.<br/><span className="text-slate-500">Many campuses. Shared ambition.</span></p></div>
        <div className="flex flex-wrap gap-2">{institutes.map((name, i) => <span key={name} className="rounded-lg border border-white/[0.08] bg-white/[0.025] px-3 py-2 text-[11px] font-medium text-slate-400 transition hover:border-indigo-300/30 hover:text-indigo-100">{name}</span>)}<span className="rounded-lg border border-dashed border-indigo-300/25 px-3 py-2 text-[11px] text-indigo-200">...and more</span></div>
      </div>
    </section>

    <section id="platform" className="relative z-10 mx-auto max-w-7xl px-5 py-24 md:px-8 md:py-32">
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: .25 }} variants={rise} className="mb-14 grid gap-5 md:grid-cols-[1fr_.7fr] md:items-end">
        <div><div className="section-kicker">A PLATFORM THAT BRINGS IT TOGETHER</div><h2 className="mt-5 max-w-2xl text-4xl font-semibold leading-tight tracking-[-0.045em] md:text-6xl">More than a network.<br/><span className="text-slate-500">A place to move forward.</span></h2></div>
        <p className="max-w-md text-sm leading-7 text-slate-400 md:justify-self-end">The best parts of campus life shouldn't stop at the campus gate. IITStudentsOS brings everyday student experiences into one shared digital space.</p>
      </motion.div>
      <div className="grid gap-4 md:grid-cols-2">
        {modules.map((feature, i) => <motion.article key={feature.number} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .15 }} transition={{ delay: i * .08, duration: .55 }} whileHover={reduceMotion ? {} : { y: -6 }} className={`feature-panel feature-${feature.tone} group relative overflow-hidden rounded-3xl border p-7 md:p-9`}>
          <div className="flex items-center justify-between"><span className="text-xs font-bold tracking-[0.2em] text-slate-500">{feature.number} / 04</span><span className="rounded-full border border-white/10 px-3 py-1 text-[9px] font-bold tracking-[0.18em] text-slate-400">{feature.tag}</span></div>
          <div className="mt-10 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.045] text-white transition duration-300 group-hover:scale-110"><feature.icon size={22}/></div>
          <h3 className="mt-6 text-2xl font-semibold tracking-tight text-white">{feature.title}</h3><p className="mt-3 max-w-md text-sm leading-7 text-slate-400">{feature.text}</p>
          <div className="pointer-events-none absolute -bottom-20 -right-16 h-48 w-48 rounded-full bg-current opacity-[0.035] blur-3xl transition duration-500 group-hover:opacity-[0.09]"/>
        </motion.article>)}
      </div>
    </section>

    <section id="mission" className="relative z-10 px-5 pb-24 md:px-8 md:pb-32">
      <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mission-panel relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] border border-indigo-200/15 px-7 py-12 md:px-16 md:py-16">
        <div className="mission-orb mission-orb-one"/><div className="mission-orb mission-orb-two"/>
        <div className="relative z-10 grid gap-10 md:grid-cols-[1fr_auto] md:items-end">
          <div><div className="section-kicker">THE IDEA IS SIMPLE</div><h2 className="mt-5 max-w-3xl text-4xl font-semibold leading-tight tracking-[-0.045em] md:text-6xl">Different campuses.<br/><span className="hero-gradient-text">One shared future.</span></h2><p className="mt-5 max-w-2xl text-sm leading-7 text-slate-300">A question answered by a student miles away. A resource that saves someone a week. A connection that becomes a collaboration. That's the community we're building.</p></div>
          <Link to="/register" className="btn-primary inline-flex items-center justify-center gap-3 rounded-xl px-6 py-4 text-sm font-bold">Join IITStudentsOS <ArrowRight size={17}/></Link>
        </div>
      </motion.div>
    </section>

    <footer className="relative z-10 border-t border-white/[0.07]">
      <div className="mx-auto flex max-w-7xl flex-col gap-7 px-5 py-9 md:flex-row md:items-center md:justify-between md:px-8">
        <div><Brand/><p className="mt-3 text-xs text-slate-500">A shared digital space for the IIT student community.</p></div>
        <div className="flex flex-wrap gap-5 text-xs text-slate-500"><a href="#community" className="hover:text-white">Community</a><a href="#platform" className="hover:text-white">Platform</a><Link to="/login" className="hover:text-white">Sign in</Link><Link to="/register" className="hover:text-white">Create account</Link></div>
        <div className="text-xs text-slate-600">© {new Date().getFullYear()} IITStudentsOS</div>
      </div>
    </footer>
  </main>
}
