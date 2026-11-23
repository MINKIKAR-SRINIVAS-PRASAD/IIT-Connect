import React,{useEffect,useMemo,useState} from 'react'
import {Link,useLocation} from 'react-router-dom'
import {motion} from 'framer-motion'
import {Newspaper,CalendarDays,BriefcaseBusiness,Images,ArrowUpRight,Search,RefreshCw,Sparkles,Linkedin,Globe2} from 'lucide-react'
import {api} from '../../utils/api'
import Loader from '../../components/common/Loader.jsx'

const filters=['All updates','International news','LinkedIn','Events','Placements','Campus moments']
const dateLabel=value=>{if(!value)return 'Recently shared';const d=new Date(value);return Number.isNaN(d.getTime())?'Recently shared':d.toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}

export default function News(){
 const faculty=useLocation().pathname.startsWith('/faculty')
 const portalBrand=faculty?'IITProfessorsOS':'IITStudentsOS'
 const [items,setItems]=useState([]),[loading,setLoading]=useState(true),[filter,setFilter]=useState('All updates'),[query,setQuery]=useState(''),[loadError,setLoadError]=useState(false)
 async function load(){
  setLoading(true)
  setLoadError(false)
  // Students and faculty intentionally receive the same campus-wide news stream.
  const requests=[api.get('/events'),api.get('/gallery'),api.get('/placements'),api.get('/news/external')]
  const results=await Promise.allSettled(requests)
  const next=[]
  const eventData=results[0].status==='fulfilled'?results[0].value.data:{}
  const events=[...(eventData.upcoming||[]),...(eventData.past||[])]
  events.forEach(x=>next.push({
   id:'event-'+x._id,type:'Events',title:x.title||'Campus event',
   description:x.description||x.details||'A campus event shared with the IIT community.',
   date:x.datetime||x.startAt||x.createdAt,
   source:x.iit||x.institute||x.author?.facultyProfile?.institute||'IIT community',
   image:x.posterUrl||x.imageUrl,href:faculty?'/faculty/events':'/app/events',icon:CalendarDays
  }))
  const galleryData=results[1].status==='fulfilled'?results[1].value.data:{}
  ;(galleryData.posts||[]).forEach(x=>next.push({
   id:'gallery-'+x._id,type:'Campus moments',title:x.caption||'A moment from campus',
   description:x.description||'A campus photo shared with the community.',date:x.createdAt,
   source:x.iit||x.institute||x.user?.profile?.iit||x.author?.facultyProfile?.institute||'Campus Gallery',
   image:x.imageUrl||x.photoUrl,href:faculty?'/faculty/gallery':'/app/gallery',icon:Images
  }))
  if(results[2]?.status==='fulfilled'){
   ;(results[2].value.data.posts||[]).forEach(x=>next.push({
    id:'placement-'+x._id,type:'Placements',title:x.title||'Placement update',
    description:x.description||x.details||'A placement and career opportunity shared on IITStudentsOS.',
    date:x.createdAt,source:x.company||x.iit||'Placement network',
    href:faculty?'/faculty/news':'/app/placements',icon:BriefcaseBusiness
   }))
  }
  const externalData=results[3]?.status==='fulfilled'?results[3].value.data:{}\n  ;(externalData.items||[]).forEach(x=>next.push({id:'external-'+x.id,type:x.category==='linkedin'?'LinkedIn':'International news',title:x.title,description:x.description||'Open the original source for the full story.',date:x.date,source:x.source||'External source',href:x.url,external:true,icon:x.category==='linkedin'?Linkedin:Globe2}))\n  setLoadError(results.some(x=>x.status==='rejected')||Boolean(externalData.partialFailure))
  next.sort((a,b)=>new Date(b.date||0)-new Date(a.date||0))
  setItems(next)
  setLoading(false)
 }
 useEffect(()=>{load()},[faculty])
 const visible=useMemo(()=>items.filter(x=>(filter==='All updates'||x.type===filter)&&[x.title,x.description,x.source,x.type].join(' ').toLowerCase().includes(query.toLowerCase())),[items,filter,query])
 return <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} className="sage-page-theme space-y-6">
  <section className="page-hero relative overflow-hidden rounded-3xl border border-[#a8c49a]/20 bg-[radial-gradient(ellipse_at_85%_5%,rgba(115,145,105,.22),transparent_38%),linear-gradient(120deg,#1b2820,#26382c_58%,#1b2a23)] p-6 md:p-8">
   <div className="absolute -right-12 -top-14 h-52 w-52 rounded-full bg-[#a8c49a]/10 blur-3xl"/>
   <div className="relative z-10 flex flex-wrap items-end justify-between gap-5"><div><div className="inline-flex items-center gap-2 rounded-full border border-[#a8c49a]/20 bg-[#a8c49a]/10 px-3 py-1.5 text-[10px] font-bold tracking-[.16em] text-[#b6d0a8]"><Sparkles size={13}/> CAMPUS JOURNAL</div><h1 className="mt-4 text-3xl font-bold tracking-tight text-[#f0f1e8] md:text-4xl">News & Updates</h1><p className="mt-2 max-w-xl text-sm leading-6 text-[#c1cbbd]">Campus updates plus international headlines and public professional posts.</p></div><button type="button" onClick={load} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[.04] px-4 py-3 text-xs font-semibold text-slate-200 hover:bg-white/[.08] disabled:opacity-50"><RefreshCw size={14} className={loading?'animate-spin':''}/> Refresh feed</button></div>
  </section>
  <div className="flex flex-col gap-3 sm:flex-row"><label className="relative flex-1"><Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search campus updates…" className="faculty-input w-full rounded-xl border border-white/10 bg-[#111810] py-3 pl-11 pr-4 text-sm text-white placeholder:text-slate-500"/></label><div className="flex flex-wrap gap-2">{filters.map(x=><button key={x} onClick={()=>setFilter(x)} className={`rounded-xl border px-3 py-2 text-xs font-semibold transition ${filter===x?'border-[#a8c49a]/30 bg-[#a8c49a]/10 text-[#c5dcb8]':'border-white/10 bg-white/[.02] text-slate-400 hover:text-white'}`}>{x}</button>)}</div></div>
  {loadError&&!loading?<div role="status" className="rounded-xl border border-amber-400/20 bg-amber-400/5 px-4 py-3 text-sm text-amber-100/80">Some feed sections could not be reached. You can retry using Refresh feed.</div>:null}
  {loading?<Loader/>:visible.length?<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{visible.map((item,i)=><motion.article key={item.id} initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:Math.min(i*.035,.2)}} className="overflow-hidden rounded-2xl border border-[#a8c49a]/15 bg-gradient-to-br from-[#202d23] to-[#151e17] shadow-[0_12px_34px_rgba(0,0,0,.12)]"><div className="relative h-44 overflow-hidden bg-[#1b2820]">{item.image?<img src={item.image} alt="" className="h-full w-full object-cover"/>:<div className="flex h-full items-center justify-center bg-[radial-gradient(ellipse_at_65%_20%,rgba(168,196,154,.18),transparent_50%)]"><item.icon size={42} className="text-[#a8c49a]/50"/></div>}<span className="absolute left-4 top-4 rounded-full border border-white/15 bg-black/35 px-3 py-1 text-[9px] font-bold tracking-[.12em] text-[#d8e4d0] backdrop-blur">{item.type.toUpperCase()}</span></div><div className="p-5"><p className="text-[10px] font-semibold tracking-wide text-[#a8c49a]">{item.source} <span className="mx-1 text-slate-600">·</span> {dateLabel(item.date)}</p><h2 className="mt-3 line-clamp-2 text-lg font-semibold leading-6 text-[#f0f1e8]">{item.title}</h2><p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-400">{item.description}</p>{item.external?<a href={item.href} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[#b6d0a8] hover:text-white">Read original <ArrowUpRight size={14}/></a>:<Link to={item.href} className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[#b6d0a8] hover:text-white">View update <ArrowUpRight size={14}/></Link>}</div></motion.article>)}</div>:<div className="rounded-2xl border border-dashed border-[#a8c49a]/20 bg-white/[.02] px-6 py-14 text-center"><Newspaper size={34} className="mx-auto text-[#a8c49a]/50"/><h2 className="mt-4 text-lg font-semibold text-slate-200">No updates match this view</h2><p className="mt-2 text-sm text-slate-500">Fresh international headlines and publicly indexed LinkedIn posts appear alongside campus updates.</p>{(filter!=='All updates'||query)&&<button onClick={()=>{setFilter('All updates');setQuery('')}} className="mt-4 text-xs font-semibold text-[#b6d0a8]">Clear filters</button>}</div>}
  <p className="text-center text-[10px] text-slate-600">External headlines are credited to their publishers and link to the original. LinkedIn items are publicly indexed posts surfaced through Google News RSS—not a LinkedIn account/API connection.</p>
 </motion.div>
}
