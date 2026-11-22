import React from 'react'
import { Outlet, Link } from 'react-router-dom'
import { ArrowUpRight, BookOpen, MessageCircle, ShieldCheck, Sparkles } from 'lucide-react'

const highlights = [
  { icon: MessageCircle, title: 'Campus conversations', text: 'Connect with students across IITs.' },
  { icon: BookOpen, title: 'Study resources', text: 'Share notes and learn together.' },
  { icon: ShieldCheck, title: 'A trusted community', text: 'IIT access with moderated spaces.' }
]

export default function AuthLayout() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#070b18] text-white">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_12%_0%,rgba(177,194,135,0.14),transparent_42%),radial-gradient(ellipse_at_90%_45%,rgba(99,102,241,0.12),transparent_40%)]" />
      <div className="relative mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
        <header className="flex items-center justify-between">
          <Link to="/" className="group flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl border border-amber-200/20 bg-amber-100/10 font-serif text-xl font-bold text-amber-200">I</span>
            <span>
              <span className="block text-lg font-semibold tracking-tight">IIT Connect</span>
              <span className="block text-[10px] uppercase tracking-[0.24em] text-slate-400">The student network</span>
            </span>
          </Link>
          <Link to="/" className="inline-flex items-center gap-1 rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300 transition hover:border-white/25 hover:text-white">
            Back home <ArrowUpRight size={15} />
          </Link>
        </header>

        <section className="mt-10 grid items-start gap-6 md:mt-16 md:grid-cols-[0.95fr_1.05fr] md:gap-10">
          <div className="rounded-[2rem] border border-emerald-100/10 bg-[#17241f]/80 p-6 sm:p-8 md:sticky md:top-8">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-200/15 bg-emerald-200/[0.06] px-3 py-2 text-xs text-emerald-100/90">
              <span className="h-2 w-2 rounded-full bg-emerald-300" />
              Private IIT community
            </div>
            <p className="text-xs uppercase tracking-[0.24em] text-amber-200/70">Connect · Learn · Grow</p>
            <h1 className="mt-3 font-serif text-3xl leading-tight sm:text-4xl">Your IIT network, <span className="italic text-amber-200">closer.</span></h1>
            <p className="mt-4 max-w-lg text-sm leading-7 text-slate-300 sm:text-base">
              Sign in or create your account to join campus conversations, explore shared knowledge and discover opportunities across institutes.
            </p>
            <div className="mt-7 space-y-3">
              {highlights.map(({ icon: Icon, title, text }) => (
                <div key={title} className="flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.035] p-3.5">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-200/10 text-emerald-200"><Icon size={19} /></span>
                  <div>
                    <h2 className="text-sm font-medium">{title}</h2>
                    <p className="mt-0.5 text-xs leading-5 text-slate-400">{text}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-5 flex items-center gap-2 text-xs text-slate-400"><Sparkles size={14} className="text-amber-200" /> Built for the IIT community</p>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-[#0d1322]/90 p-5 shadow-2xl shadow-black/20 sm:p-8">
            <Outlet />
          </div>
        </section>
        <footer className="py-8 text-center text-xs text-slate-500">IIT Connect · Student-first · Community-powered</footer>
      </div>
    </main>
  )
}
