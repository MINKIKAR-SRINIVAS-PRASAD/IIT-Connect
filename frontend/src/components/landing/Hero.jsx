import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowUpRight, BookOpen, MessageCircle, ShieldCheck, Sparkles, Users } from 'lucide-react'

const features = [
  { icon: MessageCircle, title: 'Campus conversations', detail: 'Meet students and build connections across IITs.' },
  { icon: BookOpen, title: 'Study resources', detail: 'Discover notes, references and learning material.' },
  { icon: ShieldCheck, title: 'A trusted community', detail: 'Institute access and moderated community spaces.' }
]

export default function Hero() {
  return (
    <section className="relative isolate overflow-hidden px-4 pb-16 pt-8 sm:pt-12 md:pb-24">
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_18%_8%,rgba(177,194,135,0.17),transparent_44%),radial-gradient(ellipse_at_85%_42%,rgba(195,158,91,0.12),transparent_42%)]" />
      <div className="mx-auto max-w-6xl">
        <header className="mb-12 flex items-center justify-between sm:mb-16">
          <Link to="/" className="flex items-center gap-3" aria-label="IIT Connect home">
            <span className="grid h-11 w-11 place-items-center rounded-2xl border border-amber-200/20 bg-amber-100/10 text-lg font-black text-amber-200">I</span>
            <span>
              <span className="block text-lg font-semibold tracking-tight text-white">IIT Connect</span>
              <span className="block text-[10px] uppercase tracking-[0.24em] text-slate-400">The student network</span>
            </span>
          </Link>
          <Link to="/login" className="rounded-full border border-white/15 px-4 py-2 text-sm text-slate-200 transition hover:border-amber-200/50 hover:text-amber-100">
            Sign in <ArrowUpRight className="ml-1 inline" size={15} />
          </Link>
        </header>

        <div className="grid items-center gap-12 lg:grid-cols-[1.12fr_0.88fr] lg:gap-16">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-300/15 bg-emerald-300/[0.06] px-3.5 py-2 text-xs font-medium tracking-wide text-emerald-100/90">
              <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(110,231,183,0.7)]" />
              Your IIT network, in one place
            </div>
            <p className="mb-4 text-xs uppercase tracking-[0.28em] text-amber-200/70">Connect · Learn · Grow</p>
            <h1 className="max-w-3xl text-4xl font-semibold leading-[1.08] tracking-tight text-white sm:text-6xl lg:text-7xl">
              Campus life is bigger when we're <span className="font-serif italic text-amber-200">connected.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-slate-300 sm:text-lg">
              One welcoming space for IIT students to share knowledge, find their people, follow campus stories and discover opportunities across institutes.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link to="/register" className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-200 to-amber-100 px-6 font-semibold text-slate-950 shadow-lg shadow-amber-900/20 transition hover:-translate-y-0.5 hover:shadow-amber-900/30">
                <Sparkles size={18} /> Join the network
              </Link>
              <Link to="/login" className="inline-flex min-h-14 items-center justify-center rounded-2xl border border-white/15 bg-white/[0.03] px-6 font-medium text-white transition hover:border-white/30 hover:bg-white/[0.07]">
                Continue to IIT Connect <ArrowUpRight size={17} className="ml-1" />
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-400">
              <span className="inline-flex items-center gap-2"><ShieldCheck size={15} className="text-emerald-300" /> IIT email access</span>
              <span className="hidden h-1 w-1 rounded-full bg-slate-600 sm:inline-block" />
              <span>Student-first · Community-powered</span>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.65, delay: 0.12 }} className="relative">
            <div className="absolute -inset-5 rounded-[2rem] bg-emerald-300/[0.04] blur-2xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#18251f]/90 p-5 shadow-2xl shadow-black/30 sm:p-7">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Inside the network</p>
                  <h2 className="mt-1 text-xl font-semibold text-white">Find your next connection</h2>
                </div>
                <span className="rounded-xl border border-amber-200/15 bg-amber-100/[0.06] p-3 text-amber-200"><Users size={21} /></span>
              </div>
              <div className="space-y-3">
                {features.map(({ icon: Icon, title, detail }, index) => (
                  <div key={title} className="flex gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.035] p-4 sm:p-5">
                    <span className={`mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl ${index === 1 ? 'bg-amber-200/10 text-amber-200' : 'bg-emerald-200/10 text-emerald-200'}`}><Icon size={19} /></span>
                    <div>
                      <h3 className="font-medium text-white">{title}</h3>
                      <p className="mt-1 text-sm leading-6 text-slate-400">{detail}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-5 flex items-center justify-between rounded-xl bg-emerald-200/[0.06] px-4 py-3 text-sm text-emerald-100/80">
                <span>Made for the IIT community</span>
                <span className="text-amber-200">✦</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
