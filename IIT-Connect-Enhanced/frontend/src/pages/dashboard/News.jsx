import React,{useEffect,useMemo,useRef,useState} from 'react'
import {useLocation} from 'react-router-dom'
import {motion} from 'framer-motion'
import toast from 'react-hot-toast'
import {Newspaper,ArrowUpRight,Search,RefreshCw,Sparkles,Linkedin,Globe2,Send,ShieldCheck,PenLine} from 'lucide-react'
import {api} from '../../utils/api'
import Loader from '../../components/common/Loader.jsx'

const filters=['All news','Campus news','International news','LinkedIn']
const categories=['Announcement','Achievement','Research','Campus life','Other']
const dateLabel=value=>{if(!value)return 'Recently shared';const d=new Date(value);return Number.isNaN(d.getTime())?'Recently shared':d.toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}

export default function News(){
 const faculty=useLocation().pathname.startsWith('/faculty')
 const [items,setItems]=useState([]),[mine,setMine]=useState([]),[loading,setLoading]=useState(true),[filter,setFilter]=useState('All news'),[query,setQuery]=useState(''),[loadError,setLoadError]=useState(false)
 const refreshingRef=useRef(false)
 const [formOpen,setFormOpen]=useState(false),[submitting,setSubmitting]=useState(false)
 const [form,setForm]=useState({title:'',body:'',category:'Announcement',sourceUrl:''})
 async function load(silent=false){
  if(refreshingRef.current)return
  refreshingRef.current=true
  if(!silent)setLoading(true)
  setLoadError(false)
  const results=await Promise.allSettled([api.get('/news/campus'),api.get('/news/mine'),api.get('/news/external')])
  const campus=results[0].status==='fulfilled'?results[0].value.data.posts||[]:[]
  const own=results[1].status==='fulfilled'?results[1].value.data.posts||[]:[]
  const external=results[2].status==='fulfilled'?results[2].value.data.items||[]:[]
  const campusItems=campus.map(x=>({id:'campus-'+x._id,type:'Campus news',title:x.title,description:x.body,date:x.createdAt,source:x.institute||x.authorId?.profile?.iit||x.authorId?.profile?.institute||'IIT Community',author:x.authorId?.profile?.name||'Community member',href:x.sourceUrl,category:x.category,icon:Newspaper}))
  const externalItems=external.map(x=>({id:'external-'+x.id,type:x.category==='linkedin'?'LinkedIn':'International news',title:x.title,description:x.description||'Open the original source for the full story.',date:x.date,source:x.source||'External source',href:x.url,external:true,icon:x.category==='linkedin'?Linkedin:Globe2}))
  setItems([...campusItems,...externalItems].sort((a,b)=>new Date(b.date||0)-new Date(a.date||0)))
  setMine(own)
  setLoadError(results.some(x=>x.status==='rejected')||(results[2].status==='fulfilled'&&Boolean(results[2].value.data.partialFailure)))
  refreshingRef.current=false
  setLoading(false)
 }
 useEffect(()=>{
  load()
  const refreshTimer=setInterval(()=>load(true),10000)
  return ()=>clearInterval(refreshTimer)
 },[faculty])
 async function submitNews(e){
  e.preventDefault();setSubmitting(true)
  try{
   await api.post('/news/campus',form)
   toast.success('Campus news submitted — waiting for admin approval')
   setForm({title:'',body:'',category:'Announcement',sourceUrl:''});setFormOpen(false);await load()
  }catch(error){toast.error(error?.response?.data?.message||'Could not submit campus news')}
  finally{setSubmitting(false)}
 }
 const visible=useMemo(()=>items.filter(x=>(filter==='All news'||x.type===filter)&&[x.title,x.description,x.source,x.type,x.category].join(' ').toLowerCase().includes(query.toLowerCase())),[items,filter,query])
 const filterClass=x=>filter===x?'border-[#a8c49a]/30 bg-[#a8c49a]/10 text-[#c5dcb8]':'border-white/10 bg-white/[.02] text-slate-400 hover:text-white'
 return <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} className="sage-page-theme space-y-6">
  <section className="page-hero relative overflow-hidden rounded-3xl border border-[#a8c49a]/20 bg-[radial-gradient(ellipse_at_85%_5%,rgba(115,145,105,.22),transparent_38%),linear-gradient(120deg,#1b2820,#26382c_58%,#1b2a23)] p-6 md:p-8">
   <div className="relative z-10 flex flex-wrap items-end justify-between gap-5"><div><div className="inline-flex items-center gap-2 rounded-full border border-[#a8c49a]/20 bg-[#a8c49a]/10 px-3 py-1.5 text-[10px] font-bold tracking-[.16em] text-[#b6d0a8]"><Sparkles size={13}/> COMMUNITY NEWSROOM</div><h1 className="mt-4 text-3xl font-bold tracking-tight text-[#f0f1e8] md:text-4xl">News & Updates</h1><p className="mt-2 max-w-xl text-sm leading-6 text-[#c1cbbd]">Share campus stories, discover international headlines and professional updates.</p></div><div className="flex flex-wrap gap-2"><button type="button" onClick={()=>setFormOpen(v=>!v)} className="inline-flex items-center gap-2 rounded-xl bg-[#a8c49a] px-4 py-3 text-xs font-bold text-[#152016] hover:bg-[#c0d5b4]"><PenLine size={15}/>{formOpen?'Close form':'Share campus news'}</button><button type="button" onClick={load} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[.04] px-4 py-3 text-xs font-semibold text-slate-200 hover:bg-white/[.08] disabled:opacity-50"><RefreshCw size={14} className={loading?'animate-spin':''}/> Refresh</button></div></div>
  </section>
  {formOpen&&<form onSubmit={submitNews} className="rounded-2xl border border-[#a8c49a]/20 bg-[#172219] p-5 md:p-6 space-y-4">
   <div className="flex items-center gap-2 text-[#c5dcb8]"><Send size={17}/><h2 className="font-semibold">Submit a campus story</h2></div>
   <p className="text-xs text-slate-400">Students and faculty can contribute. Posts appear publicly after admin approval.</p>
   <div className="grid gap-3 md:grid-cols-2"><input required minLength={5} maxLength={160} value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="Headline (5–160 characters)" className="rounded-xl border border-white/10 bg-[#101710] px-4 py-3 text-sm text-white placeholder:text-slate-500"/><select value={form.category} onChange={e=>setForm({...form,category:e.target.value})} className="rounded-xl border border-white/10 bg-[#101710] px-4 py-3 text-sm text-white">{categories.map(c=><option key={c}>{c}</option>)}</select></div>
   <textarea required minLength={20} maxLength={6000} rows={5} value={form.body} onChange={e=>setForm({...form,body:e.target.value})} placeholder="Tell the campus community what happened (20–6000 characters)…" className="w-full rounded-xl border border-white/10 bg-[#101710] px-4 py-3 text-sm text-white placeholder:text-slate-500"/>
   <input type="url" value={form.sourceUrl} onChange={e=>setForm({...form,sourceUrl:e.target.value})} placeholder="Optional source link (https://…)" className="w-full rounded-xl border border-white/10 bg-[#101710] px-4 py-3 text-sm text-white placeholder:text-slate-500"/>
   <button disabled={submitting} className="rounded-xl bg-[#a8c49a] px-5 py-3 text-sm font-bold text-[#152016] disabled:opacity-50">{submitting?'Submitting…':'Submit for review'}</button>
  </form>}
  {mine.some(x=>x.status==='Pending'||x.status==='Rejected')&&<section className="rounded-xl border border-amber-300/15 bg-amber-300/[.04] p-4"><h2 className="text-sm font-semibold text-amber-100">Your submissions</h2><div className="mt-2 space-y-2">{mine.filter(x=>x.status!=='Approved').map(x=><div key={x._id} className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300"><span>{x.title}{x.rejectionReason?' — '+x.rejectionReason:''}</span><span className={x.status==='Rejected'?'text-red-300':'text-amber-200'}>{x.status}</span></div>)}</div></section>}
  <div className="flex flex-col gap-3 sm:flex-row"><label className="relative flex-1"><Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search news…" className="faculty-input w-full rounded-xl border border-white/10 bg-[#111810] py-3 pl-11 pr-4 text-sm text-white placeholder:text-slate-500"/></label><div className="flex flex-wrap gap-2">{filters.map(x=><button key={x} onClick={()=>setFilter(x)} className={'rounded-xl border px-3 py-2 text-xs font-semibold transition '+filterClass(x)}>{x}</button>)}</div></div>
  {loadError&&!loading?<div role="status" className="rounded-xl border border-amber-400/20 bg-amber-400/5 px-4 py-3 text-sm text-amber-100/80">Some news sources could not be reached. Try Refresh.</div>:null}
  {loading?<Loader/>:visible.length?<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{visible.map((item,i)=><motion.article key={item.id} initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:Math.min(i*.035,.2)}} className="overflow-hidden rounded-2xl border border-[#a8c49a]/15 bg-gradient-to-br from-[#202d23] to-[#151e17] shadow-[0_12px_34px_rgba(0,0,0,.12)]"><div className="relative flex h-28 items-center justify-between bg-[radial-gradient(ellipse_at_65%_20%,rgba(168,196,154,.18),transparent_50%)] px-5"><item.icon size={38} className="text-[#a8c49a]/55"/><span className="rounded-full border border-white/15 bg-black/20 px-3 py-1 text-[9px] font-bold tracking-[.12em] text-[#d8e4d0]">{item.type.toUpperCase()}</span></div><div className="p-5"><p className="text-[10px] font-semibold tracking-wide text-[#a8c49a]">{item.source}{item.author?' · '+item.author:''}<span className="mx-1 text-slate-600">·</span>{dateLabel(item.date)}</p><h2 className="mt-3 line-clamp-2 text-lg font-semibold leading-6 text-[#f0f1e8]">{item.title}</h2><p className="mt-2 line-clamp-4 whitespace-pre-line text-sm leading-6 text-slate-400">{item.description}</p>{item.href&&<a href={item.href} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[#b6d0a8] hover:text-white">Read source <ArrowUpRight size={14}/></a>}</div></motion.article>)}</div>:<div className="rounded-2xl border border-dashed border-[#a8c49a]/20 bg-white/[.02] px-6 py-14 text-center"><Newspaper size={34} className="mx-auto text-[#a8c49a]/50"/><h2 className="mt-4 text-lg font-semibold text-slate-200">No news match this view</h2><p className="mt-2 text-sm text-slate-500">Be the first to submit a campus story.</p>{(filter!=='All news'||query)&&<button onClick={()=>{setFilter('All news');setQuery('')}} className="mt-4 text-xs font-semibold text-[#b6d0a8]">Clear filters</button>}</div>}
  <p className="flex items-center justify-center gap-1.5 text-center text-[10px] text-slate-600"><ShieldCheck size={12}/> Campus submissions are reviewed before publication. External feeds link to publishers; LinkedIn results are publicly indexed.</p>
 </motion.div>
}
