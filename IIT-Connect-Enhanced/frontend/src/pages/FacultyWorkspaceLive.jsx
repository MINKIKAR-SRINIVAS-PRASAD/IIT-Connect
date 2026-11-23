import React,{useEffect,useState} from 'react'
import {NavLink} from 'react-router-dom'
import {Home,CalendarDays,Images,BookOpen,FileText,Plane,MessageSquare,Newspaper,Send,RefreshCw,ImageIcon,Sparkles} from 'lucide-react'
import {useAuth} from '../hooks/useAuth'
import {api} from '../utils/api'
import toast from 'react-hot-toast'
import PortalShell from '../layouts/PortalShell.jsx'
import CreatePostPanel from '../components/common/CreatePostPanel.jsx'
import BrandSymbol from '../components/common/BrandSymbol'
const nav=[['home','Faculty Home',Home],['events','Events',CalendarDays],['gallery','Gallery',Images],['study','Study',BookOpen],['publications','Publications',FileText],['travel','Travel',Plane],['community','Chat & Community',MessageSquare],['news','News',Newspaper]]
const blank={title:'',description:'',startAt:'',venue:'',registrationUrl:'',imageUrl:'',caption:'',subject:'',resourceUrl:'',from:'',to:'',travelDate:'',text:'',abstract:'',institute:'',department:'',publicationType:'journal'}
const input='faculty-input w-full rounded-xl border p-3 text-sm placeholder:text-slate-500'
const card='faculty-card rounded-2xl border p-5'
const button='faculty-button rounded-xl px-4 py-3 text-sm font-semibold'
export default function FacultyWorkspace({section='home'}){
 const {user}=useAuth(),[items,setItems]=useState([]),[f,setF]=useState(blank),[busy,setBusy]=useState(false),[menuOpen,setMenuOpen]=useState(false),[createOpen,setCreateOpen]=useState(false)
 const paths={events:'/faculty/events',gallery:'/faculty/gallery',study:'/faculty/study',publications:'/faculty/publications',travel:'/faculty/travel'}
 const path=paths[section],heading=nav.find(x=>x[0]===section)?.[1]||'Faculty Network'
 const set=(k,v)=>setF(p=>({...p,[k]:v}))
 async function load(){try{if(path){const {data}=await api.get(path);setItems(data.events||data.posts||data.resources||data.publications||data.plans||[])}else if(section==='community'){await api.post('/faculty/community/join');const {data}=await api.get('/faculty/community/messages');setItems(data.messages||[])}}catch(e){toast.error(e?.response?.data?.message||'Unable to load faculty content')}}
 useEffect(()=>{setItems([]);setF(blank);setCreateOpen(false);load()},[section])
 useEffect(()=>{if(section!=='community')return;const timer=setInterval(async()=>{try{const {data}=await api.get('/faculty/community/messages');setItems(data.messages||[])}catch{}},5000);return()=>clearInterval(timer)},[section])
 const field=(key,label,type='text',required=true)=><label className="block space-y-1.5"><span className="text-xs text-slate-400">{label}</span><input className={input} required={required} type={type} value={f[key]} onChange={e=>set(key,e.target.value)} placeholder={label}/></label>
 const area=(key,label)=><label className="block space-y-1.5"><span className="text-xs text-slate-400">{label}</span><textarea className={input} rows={4} value={f[key]} onChange={e=>set(key,e.target.value)} placeholder={label}/></label>
 async function submit(e){e.preventDefault();setBusy(true);try{let payload={...f};if(section==='events')payload.startAt=new Date(f.startAt).toISOString();if(section==='travel')payload.travelDate=new Date(f.travelDate).toISOString();const {data}=await api.post(section==='community'?'/faculty/community/messages':path,payload);if(section==='community')toast.success('Message sent to faculty colleagues');else toast.success('Shared with faculty network');setF(blank);await load()}catch(e){toast.error(e?.response?.data?.message||'Submission failed')}finally{setBusy(false)}}
 let cards=items.map(x=>({id:x._id,title:x.title||x.text||x.caption,meta:x.institute||x.subject||x.venue||x.publicationType||[x.from,x.to].filter(Boolean).join(' → '),body:x.description||x.abstract||x.text||'',link:x.resourceUrl||x.registrationUrl||x.doiOrUrl||x.imageUrl,author:x.author?.facultyProfile?.name||x.sender?.facultyProfile?.name,date:x.startAt||x.travelDate||x.createdAt}))

 const pageCopy={
  home:['Faculty Home','Your professional space for research, collaboration and campus exchange.'],
  events:['Events','Discover and share faculty events, conferences and academic gatherings.'],
  gallery:['Gallery','Share research, campus and professional moments with faculty colleagues.'],
  study:['Study','Exchange teaching resources, research material and academic references.'],
  publications:['Publications','Showcase publications and research contributions across institutes.'],
  travel:['Travel','Coordinate academic travel, conferences and professional visits.'],
  community:['Chat & Community','Connect and exchange messages with verified faculty colleagues.']
 }
 const PageIcon=nav.find(x=>x[0]===section)?.[2]||Home
 const fieldGrid='grid gap-4 sm:grid-cols-2 xl:grid-cols-3'
 return <PortalShell>
 <div className="sage-page-theme w-full">
  <header className="page-hero mb-6 flex items-center gap-4 overflow-hidden rounded-3xl border p-6 md:p-8">
   <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-[#a8c49a]/25 bg-[#a8c49a]/10"><PageIcon size={27} className="text-[#b6d0a8]"/></div>
   <div className="min-w-0 flex-1"><div className="mb-2 flex items-center gap-3"><BrandSymbol className="h-8 w-[60px] object-contain"/><span className="text-[10px] font-semibold uppercase tracking-[.18em] text-slate-400">IITProfessorsOS · Faculty Workspace</span></div><h1 className="mt-1 text-3xl font-bold tracking-tight">{heading}</h1><p className="mt-1 text-sm">{pageCopy[section]?.[1]||'Academic collaboration across institutes.'}</p></div>
   {path&&<button type="button" onClick={load} title="Refresh content" className="shrink-0 rounded-xl border border-white/10 p-3 text-slate-300 transition hover:bg-white/5"><RefreshCw size={17}/></button>}
  </header>
  {section==='home'?<div className="space-y-5">
   <article className={card+' faculty-panel'}><p className="text-xs font-semibold uppercase tracking-[.15em] text-[#b6d0a8]">Faculty workspace</p><h2 className="mt-2 text-2xl font-semibold">Welcome, {user?.facultyProfile?.name||'Faculty colleague'}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">Share academic events, research resources, publications, gallery moments and travel collaboration with verified colleagues.</p><div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-400"><span className="rounded-full border border-white/10 px-3 py-1.5">{user?.facultyProfile?.institute||'Faculty institute'}</span><span className="rounded-full border border-white/10 px-3 py-1.5">{user?.facultyProfile?.department||'Department'}</span></div></article>
   <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{nav.slice(1).map(([key,label,TileIcon])=><NavLink key={key} to={'/faculty/'+key} className={card+' faculty-panel group flex min-h-32 items-center gap-4 transition hover:-translate-y-0.5'}><div className="rounded-xl border border-[#a8c49a]/20 bg-[#a8c49a]/10 p-3 text-[#b6d0a8]"><TileIcon size={22}/></div><div className="min-w-0 flex-1"><h2 className="font-semibold">{label}</h2><p className="mt-1 text-xs text-slate-400">Open faculty {label.toLowerCase()}</p></div></NavLink>)}</div>
  </div>:<div className="space-y-5">
   {section==='gallery'?<CreatePostPanel eyebrow="FACULTY COMMUNITY" title="Share a faculty moment" description="Share research, campus and professional moments with faculty colleagues." buttonLabel="Add photo" open={createOpen} onToggle={()=>setCreateOpen(v=>!v)}>
    <form onSubmit={submit} className="faculty-panel space-y-5">
      <div className={fieldGrid}>{field('imageUrl','Direct HTTPS image URL','url')}{field('caption','Image caption')}</div>
      <p className="text-xs text-slate-500">Add an image link and caption to share with faculty colleagues.</p>
      <div className="flex flex-wrap items-center gap-3 border-t border-white/10 pt-4"><button disabled={busy} className={button}>{busy?'Saving…':'Share photo'}</button><button type="button" onClick={()=>setF(blank)} className="rounded-xl border border-white/10 px-4 py-3 text-sm text-slate-300 hover:bg-white/5">Clear form</button></div>
    </form>
   </CreatePostPanel>:<CreatePostPanel eyebrow="FACULTY COMMUNITY" title={section==='community'?'Share with faculty colleagues':'Create '+heading.toLowerCase()+' post'} description={pageCopy[section]?.[1]||'Share an update with verified faculty colleagues.'} buttonLabel={section==='community'?'Send message':'Create post'} open={createOpen} onToggle={()=>setCreateOpen(v=>!v)}>
    <form onSubmit={submit} className="faculty-panel space-y-5">
    {section==='events'&&<><div className={fieldGrid}>{field('title','Event title')}{field('startAt','Date & Time','datetime-local')}{field('venue','Venue')}</div>{area('description','Description')}{field('registrationUrl','Registration link','url',false)}</>}
    {section==='gallery'&&<><div className={fieldGrid}>{field('imageUrl','Direct HTTPS image URL','url')}{field('caption','Image caption')}</div><p className="text-xs text-slate-500">Paste a direct image URL to share a faculty gallery post.</p></>}
    {section==='study'&&<><div className={fieldGrid}>{field('title','Resource title')}{field('subject','Subject / research area')}{field('resourceUrl','Resource link','url',false)}</div>{area('description','Description / resource notes')}</>}
    {section==='travel'&&<><div className={fieldGrid}>{field('title','Travel / conference title')}{field('from','From')}{field('to','Destination')}{field('travelDate','Travel date','date')}</div>{area('description','Collaboration details')}</>}
    {section==='publications'&&<><div className={fieldGrid}>{field('title','Publication title')}{field('institute','Institute')}{field('department','Department')}</div>{area('abstract','Abstract / summary')}<label className="block space-y-2"><span className="text-sm font-medium text-slate-300">Publication type</span><select className={input} value={f.publicationType} onChange={e=>set('publicationType',e.target.value)}><option value="journal">Journal</option><option value="conference">Conference</option><option value="book">Book</option><option value="patent">Patent</option><option value="preprint">Preprint</option><option value="other">Other</option></select></label></>}
    {section==='community'&&<textarea required minLength={1} maxLength={3000} className={input} rows={4} placeholder="Message verified faculty colleagues…" value={f.text} onChange={e=>set('text',e.target.value)}/>}
    <div className="flex flex-wrap items-center gap-3 border-t border-white/10 pt-4"><button disabled={busy} className={button}>{busy?'Saving…':section==='community'?<><Send size={15} className="inline"/> Send message</>:'Share with faculty'}</button><button type="button" onClick={()=>setF(blank)} className="rounded-xl border border-white/10 px-4 py-3 text-sm text-slate-300 hover:bg-white/5">Clear form</button></div>
    </form>
   </CreatePostPanel>}
   {section==='gallery'?<section className="space-y-4">
    <div className="flex items-center gap-3"><div className="flex items-center gap-2 rounded-full border border-[#a8c49a]/25 bg-[#a8c49a]/10 px-4 py-2 text-[#b6d0a8]"><Sparkles size={16}/><span className="font-semibold">All Photos</span></div><div className="h-px flex-1 bg-white/10"/><span className="text-sm text-slate-500">{cards.length} {cards.length===1?'photo':'photos'}</span></div>
    {cards.length?<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{cards.map(x=><article key={x.id} className="overflow-hidden rounded-2xl border border-white/10 bg-[#172219]">{x.link&&<a href={x.link} target="_blank" rel="noreferrer"><img src={x.link} alt={x.title||'Faculty gallery photo'} className="h-56 w-full object-cover"/></a>}<div className="p-4"><h3 className="font-semibold">{x.title||'Faculty moment'}</h3>{x.body&&<p className="mt-2 whitespace-pre-wrap text-sm text-slate-300">{x.body}</p>}{x.date&&<time className="mt-3 block text-xs text-slate-500">{new Date(x.date).toLocaleDateString()}</time>}</div></article>)}</div>:<div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/[.02] py-16 text-center"><ImageIcon size={48} className="mb-4 text-slate-600"/><p className="text-slate-400">No faculty photos yet. Be the first to share a moment!</p></div>}
   </section>:<section className="space-y-3"><div className="flex items-center gap-3"><h2 className="text-lg font-semibold">{section==='community'?'Faculty messages':heading}</h2><span className="h-px flex-1 bg-white/10"/></div>
    {cards.map(x=><article key={x.id} className={card+' faculty-panel'}><div className="flex flex-wrap items-start justify-between gap-2"><p className="text-xs font-medium text-[#b6d0a8]">{x.meta||heading}</p>{x.date&&<time className="text-xs text-slate-500">{new Date(x.date).toLocaleString()}</time>}</div><h3 className="mt-2 text-base font-semibold">{x.title}</h3>{x.body&&<p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-300">{x.body}</p>}{x.link&&<a href={x.link} target="_blank" rel="noreferrer" className="mt-3 inline-flex break-all text-sm text-[#c2d8ae] underline underline-offset-4">{x.link}</a>}{x.author&&<p className="mt-3 border-t border-white/5 pt-3 text-xs text-slate-500">{x.author}</p>}</article>)}
    {!cards.length&&<div className={card+' faculty-panel flex items-center justify-center py-10 text-center text-sm text-slate-400'}>Nothing posted yet — add the first faculty contribution.</div>}
   </section>}
  </div>}
 </div>
</PortalShell>
}
