import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  ArrowUpRight, BookOpen, BriefcaseBusiness, CalendarDays, Camera,
  Compass, GraduationCap, Image as ImageIcon, MessageCircle, RefreshCw,
  Sparkles, Users, Zap
} from 'lucide-react'
import { api } from '../../utils/api'
import { formatDateTime, formatDate } from '../../utils/formatters'
import Loader from '../../components/common/Loader.jsx'
import { useAuth } from '../../hooks/useAuth'

const reveal = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: .5, ease: [0.22,1,.36,1] } } }
const quickLinks = [
  { to: '/app/chat', title: 'Meet your people', subtitle: 'Conversations across IITs', icon: MessageCircle, tone: 'violet' },
  { to: '/app/study', title: 'Learn together', subtitle: 'Notes and study material', icon: BookOpen, tone: 'cyan' },
  { to: '/app/placements', title: 'Career stories', subtitle: 'Experiences and insights', icon: BriefcaseBusiness, tone: 'amber' },
  { to: '/app/trip', title: 'Find your next trip', subtitle: 'Explore plans and join students', icon: Compass, tone: 'rose' }
]

export default function HomeFeed() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [events, setEvents] = useState([])
  const [gallery, setGallery] = useState([])

  async function loadData(isRefresh = false) {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    try {
      const [eventsRes, galleryRes] = await Promise.all([api.get('/events'), api.get('/gallery')])
      const eventPayload = eventsRes.data || {}
      setEvents(Array.isArray(eventPayload.upcoming) ? eventPayload.upcoming.slice(0, 3) : [])
      setGallery(Array.isArray(galleryRes.data?.posts) ? galleryRes.data.posts.slice(0, 6) : [])
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Could not refresh your campus feed')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { loadData() }, [])

  const firstName = user?.profile?.name?.trim()?.split(/\s+/)[0] || 'there'
  const institute = user?.profile?.iit || 'your IIT'
  const today = useMemo(() => new Intl.DateTimeFormat('en-IN', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date()), [])

  if (loading) return <div className="flex min-h-[55vh] items-center justify-center"><Loader/></div>

  return <div className="space-y-9 pb-5">
    <motion.section initial="hidden" animate="show" variants={reveal} className="home-hero relative isolate overflow-hidden rounded-[2rem] border border-indigo-200/10 px-6 py-8 md:px-10 md:py-11">
      <div className="home-hero-grid pointer-events-none absolute inset-0"/>
      <div className="home-hero-glow pointer-events-none absolute -right-20 -top-28 h-80 w-80 rounded-full"/>
      <div className="relative z-10 grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200/15 bg-indigo-200/[0.07] px-3 py-1.5 text-[10px] font-bold tracking-[.16em] text-indigo-200"><Sparkles size={13}/> YOUR IIT NETWORK, IN ONE PLACE</div>
          <p className="mt-6 text-xs font-medium text-slate-500">{today} <span className="mx-2 text-slate-700">/</span> {institute}</p>
          <h1 className="mt-3 text-4xl font-semibold leading-[1.08] tracking-[-.05em] text-white md:text-6xl">Good to see you,<br/><span className="home-gradient-text">{firstName}.</span></h1>
          <p className="mt-5 max-w-xl text-sm leading-7 text-slate-400 md:text-base">Your campus is one part of a much bigger story. Find your people, share what you know and discover what's happening across the IIT community.</p>
          <div className="mt-7 flex flex-wrap gap-3"><Link to="/app/chat" className="btn-primary inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold">Explore community <ArrowUpRight size={16}/></Link><Link to="/app/study" className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.035] px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.07]">Open Study Hub <BookOpen size={15}/></Link></div>
        </div>
        <div className="hidden min-w-[190px] rounded-2xl border border-white/10 bg-slate-950/35 p-4 backdrop-blur-xl md:block">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-200"><span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(110,231,183,.7)]"/> YOUR COMMUNITY IS HERE</div>
          <div className="mt-4 flex -space-x-2">{['I','I','I','+'].map((x,i)=><div key={i} className={`flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#11152b] text-[10px] font-bold ${i===3?'bg-indigo-400/20 text-indigo-100':'bg-slate-800 text-slate-300'}`}>{x}</div>)}</div>
          <p className="mt-3 text-[11px] leading-5 text-slate-500">One network for conversations, knowledge and campus life.</p>
        </div>
      </div>
    </motion.section>

    <motion.section initial="hidden" animate="show" variants={{hidden:{},show:{transition:{staggerChildren:.07}}}} className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {quickLinks.map((item) => <motion.div key={item.to} variants={reveal} whileHover={{y:-4}}><Link to={item.to} className={`quick-tile quick-${item.tone} group flex h-full items-center gap-4 rounded-2xl border p-4 transition duration-300`}><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.045] text-white transition group-hover:scale-105"><item.icon size={20}/></span><span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-slate-100">{item.title}</span><span className="mt-1 block text-[11px] text-slate-500">{item.subtitle}</span></span><ArrowUpRight size={15} className="text-slate-600 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white"/></Link></motion.div>)}
    </motion.section>

    <section className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3"><div><div className="section-kicker">WHAT'S HAPPENING</div><h2 className="mt-2 text-2xl font-semibold tracking-tight text-white md:text-3xl">Across the campuses</h2><p className="mt-1 text-sm text-slate-500">A glimpse of what's coming up in the community.</p></div><button type="button" onClick={() => loadData(true)} disabled={refreshing} className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold text-slate-400 transition hover:bg-white/[0.04] hover:text-white disabled:opacity-50"><RefreshCw size={13} className={refreshing?'animate-spin':''}/> Refresh feed</button></div>
      {events.length ? <div className="grid gap-4 lg:grid-cols-3">{events.map((event,index) => <motion.article key={event._id} initial={{opacity:0,y:18}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:index*.07}} whileHover={{y:-5}} className="event-card group overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0c1020]">
        <div className="relative h-44 overflow-hidden bg-gradient-to-br from-indigo-950 via-slate-900 to-cyan-950">{event.posterUrl ? <img src={event.posterUrl} alt={event.title || 'Event poster'} className="h-full w-full object-cover transition duration-700 group-hover:scale-105"/> : <div className="flex h-full items-center justify-center"><CalendarDays size={42} className="text-indigo-200/30"/></div>}<div className="absolute inset-0 bg-gradient-to-t from-[#0c1020] via-transparent to-transparent"/><span className="absolute left-4 top-4 rounded-full border border-white/15 bg-black/30 px-3 py-1 text-[9px] font-bold tracking-[.15em] text-white backdrop-blur">CAMPUS EVENT</span></div>
        <div className="p-5"><h3 className="line-clamp-2 text-lg font-semibold text-white">{event.title}</h3><p className="mt-2 text-xs text-slate-500">{event.iit || 'IIT community'}</p><div className="mt-4 flex items-center justify-between gap-3 border-t border-white/[0.07] pt-3 text-[11px] text-slate-400"><span className="flex items-center gap-2"><CalendarDays size={13} className="text-indigo-300"/>{formatDateTime(event.datetime)}</span><Link to="/app/events" className="inline-flex items-center gap-1 font-semibold text-indigo-300 hover:text-white">Details <ArrowUpRight size={13}/></Link></div></div>
      </motion.article>)}</div> : <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-5 py-10 text-center"><CalendarDays size={28} className="mx-auto text-slate-600"/><p className="mt-3 text-sm font-medium text-slate-300">No upcoming events yet</p><p className="mt-1 text-xs text-slate-600">Check back soon for updates from other campuses.</p></div>}
    </section>

    <section className="space-y-5">
      <div className="flex items-end justify-between gap-3"><div><div className="section-kicker">CAMPUS MOMENTS</div><h2 className="mt-2 text-2xl font-semibold tracking-tight text-white md:text-3xl">Life beyond your campus</h2><p className="mt-1 text-sm text-slate-500">Snapshots shared by students across the network.</p></div><Link to="/app/gallery" className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-300 transition hover:text-white">Explore gallery <ArrowUpRight size={14}/></Link></div>
      {gallery.length ? <div className="gallery-mosaic grid grid-cols-2 gap-3 md:grid-cols-3">{gallery.map((post,index) => <motion.div key={post._id} initial={{opacity:0,scale:.97}} whileInView={{opacity:1,scale:1}} viewport={{once:true}} transition={{delay:index*.05}} whileHover={{y:-4}} className={`gallery-tile group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-slate-900 ${index===0?'row-span-2 min-h-[300px] md:min-h-[390px]':'min-h-[145px] md:min-h-[185px]'}`}><img src={post.imageUrl} alt={post.caption || 'Student campus moment'} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-110"/><div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/5 opacity-80"/><div className="absolute inset-x-0 bottom-0 p-3 md:p-4"><p className="line-clamp-2 text-xs font-semibold text-white">{post.caption || 'A moment from campus life'}</p><p className="mt-1 text-[10px] text-slate-300/75">{post.iit || post.authorId?.profile?.iit || 'IIT Community'}{post.authorId?.profile?.name ? ` · ${post.authorId.profile.name}` : ''}</p></div><span className="absolute right-3 top-3 rounded-lg border border-white/15 bg-black/25 p-2 text-white opacity-0 backdrop-blur transition group-hover:opacity-100"><Camera size={14}/></span></motion.div>)}</div> : <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-5 py-10 text-center"><ImageIcon size={28} className="mx-auto text-slate-600"/><p className="mt-3 text-sm font-medium text-slate-300">The gallery is waiting for its first moments</p><Link to="/app/gallery" className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-indigo-300 hover:text-white">Share a campus photo <ArrowUpRight size={13}/></Link></div>}
    </section>

    <section className="home-share-cta relative overflow-hidden rounded-3xl border p-6 md:p-8"><div className="pointer-events-none absolute -right-10 -top-24 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl"/><div className="relative flex flex-wrap items-center justify-between gap-5"><div><div className="text-[10px] font-bold tracking-[.2em] text-cyan-200">YOUR NEXT CONNECTION STARTS HERE</div><h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">Have something worth sharing?</h2><p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">A useful note, a campus event, a placement experience or a travel plan — your contribution can help another student.</p></div><Link to="/app/study" className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.06] px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.1]">Share something <ArrowUpRight size={16}/></Link></div></section>
  </div>
}
