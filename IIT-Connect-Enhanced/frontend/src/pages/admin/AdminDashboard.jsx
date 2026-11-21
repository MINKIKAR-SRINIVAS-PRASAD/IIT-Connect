import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Users, Images, ClipboardCheck, ArrowUpRight, RefreshCw, ShieldCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import { api } from '../../utils/api'
import Loader from '../../components/common/Loader'

const cards = [
  { key:'totalUsers', label:'Registered students', icon:Users, tone:'green', note:'Community members' },
  { key:'totalPosts', label:'Shared content', icon:Images, tone:'sage', note:'Across the platform' },
  { key:'pendingApprovals', label:'Awaiting review', icon:ClipboardCheck, tone:'gold', note:'Needs admin attention' }
]

export default function AdminDashboard() {
  const [loading,setLoading]=useState(true)
  const [refreshing,setRefreshing]=useState(false)
  const [stats,setStats]=useState(null)
  async function load(refresh=false) {
    refresh?setRefreshing(true):setLoading(true)
    try { const {data}=await api.get('/admin/stats'); setStats(data.stats) }
    catch(error) { toast.error(error?.response?.data?.message || 'Failed to load stats') }
    finally { setLoading(false); setRefreshing(false) }
  }
  useEffect(()=>{load()},[])
  if(loading) return <Loader/>
  return <div className="space-y-8">
    <motion.section initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} className="overflow-hidden rounded-3xl border border-[#315d3e]/10 bg-gradient-to-r from-[#eaf1df] via-[#f8faf3] to-[#e6f0e8] p-6 md:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4"><div><div className="inline-flex items-center gap-2 text-[10px] font-bold tracking-[.18em] text-[#64834a]"><ShieldCheck size={14}/> ADMIN CONTROL CENTRE</div><h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#203927] md:text-4xl">Good work starts with a clear view.</h1><p className="mt-2 max-w-xl text-sm leading-6 text-[#718075]">Monitor the student community, review shared content and keep IITStudentsOS running smoothly.</p></div><button onClick={()=>load(true)} disabled={refreshing} className="inline-flex items-center gap-2 rounded-xl border border-[#315d3e]/15 bg-white/70 px-4 py-2.5 text-xs font-semibold text-[#47654c] hover:bg-white disabled:opacity-50"><RefreshCw size={14} className={refreshing?'animate-spin':''}/>Refresh stats</button></div>
    </motion.section>
    <section className="grid gap-4 md:grid-cols-3">
      {cards.map(({key,label,icon:Icon,tone,note},i)=><motion.article key={key} initial={{opacity:0,y:18}} animate={{opacity:1,y:0}} transition={{delay:i*.08}} whileHover={{y:-4}} className="rounded-2xl border border-[#315d3e]/10 bg-white/85 p-5 shadow-[0_12px_35px_rgba(43,68,42,.05)]"><div className="flex items-center justify-between"><span className="text-sm font-medium text-[#718075]">{label}</span><span className={`flex h-10 w-10 items-center justify-center rounded-xl ${tone==='gold'?'bg-[#f6eedc] text-[#a77b35]':'bg-[#eaf1df] text-[#527b42]'}`}><Icon size={19}/></span></div><div className="mt-5 text-4xl font-semibold tracking-tight text-[#203927]">{stats?.[key] ?? 0}</div><div className="mt-2 text-xs text-[#89958a]">{note}</div></motion.article>)}
    </section>
    <section className="grid gap-4 md:grid-cols-2">
      <Link to="/admin/approvals" className="group flex items-center justify-between rounded-2xl border border-[#315d3e]/10 bg-white/80 p-5 transition hover:-translate-y-1 hover:border-[#719b42]/40 hover:shadow-lg"><div><div className="font-semibold text-[#29452f]">Review submissions</div><p className="mt-1 text-xs text-[#819084]">Check student posts and approve content.</p></div><ArrowUpRight size={18} className="text-[#719b42] transition group-hover:-translate-y-1 group-hover:translate-x-1"/></Link>
      <Link to="/admin/users" className="group flex items-center justify-between rounded-2xl border border-[#315d3e]/10 bg-white/80 p-5 transition hover:-translate-y-1 hover:border-[#719b42]/40 hover:shadow-lg"><div><div className="font-semibold text-[#29452f]">Manage students</div><p className="mt-1 text-xs text-[#819084]">View registered accounts and profiles.</p></div><ArrowUpRight size={18} className="text-[#719b42] transition group-hover:-translate-y-1 group-hover:translate-x-1"/></Link>
    </section>
  </div>
}
