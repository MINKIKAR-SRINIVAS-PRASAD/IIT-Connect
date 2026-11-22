import React, { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarDays, Images, BookOpen, FileText, Plane, MessageSquare, Home, Newspaper, RefreshCw, Send, Upload, Trash2, ExternalLink } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { api } from '../utils/api'
import toast from 'react-hot-toast'
import PortalShell from '../layouts/PortalShell.jsx'

const nav = [
  ['home','Faculty Home',Home],['events','Events',CalendarDays],['gallery','Gallery',Images],
  ['study','Study',BookOpen],['placements','Placements',FileText],['publications','Publications',FileText],['travel','Travel',Plane],
  ['community','Chat & Community',MessageSquare],['news','News',Newspaper]
]
const sectionLabels = { events:'Events',gallery:'Gallery',study:'Study',publications:'Publications',travel:'Travel',placements:'Placements' }
const initial = { title:'',description:'',date:'',venue:'',url:'',caption:'',subject:'',category:'',institute:'',department:'',from:'',destination:'' }
const fieldClass='w-full rounded-xl border border-white/10 bg-[#111810] px-3.5 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-[#a8c49a]/50 focus:outline-none'
const cardClass='rounded-2xl border border-[#a8c49a]/15 bg-gradient-to-br from-[#202d23] to-[#151e17] p-5'
export default function FacultyWorkspaceLive({section='home'}){
 const {user}=useAuth()
 const [items,setItems]=useState([]),[form,setForm]=useState(initial),[file,setFile]=useState(null),[message,setMessage]=useState(''),[messages,setMessages]=useState([]),[busy,setBusy]=useState(false),[loading,setLoading]=useState(false)
 const facultyName=user?.facultyProfile?.name||user?.profile?.name||user?.email||'Faculty'
 const set=(key,value)=>setForm(p=>({...p,[key]:value}))
 const load=useCallback(async()=>{
  if(section==='home'||section==='news')return
  setLoading(true)
  try{
   if(section==='community'){const {data}=await api.get('/faculty/community');setMessages(data.messages||[])}
   else {const {data}=await api.get('/faculty/content',{params:{section}});setItems(data.posts||[])}
  }catch(e){toast.error(e?.response?.data?.message||'Could not load faculty content')}
  finally{setLoading(false)}
 },[section])
 useEffect(()=>{setItems([]);setMessages([]);setForm(initial);setFile(null);load()},[load])
 async function submit(e){
  e.preventDefault();setBusy(true)
  try{
   if(section==='community'){
    await api.post('/faculty/community',{text:message.trim()});setMessage('');toast.success('Message sent to faculty colleagues');await load()
   }else{
    const fd=new FormData();fd.append('section',section)
    Object.entries(form).forEach(([k,v])=>{if(v)fd.append(k,v)})
    if(file)fd.append('media',file)
    await api.post('/faculty/content',fd)
    setForm(initial);setFile(null);toast.success('Your faculty post was saved and is awaiting review.');await load()
   }
  }catch(e){toast.error(e?.response?.data?.message||'Could not submit')}
  finally{setBusy(false)}
 }
 async function remove(id){if(!window.confirm('Delete this faculty post?'))return;try{await api.delete('/faculty/content/'+id);setItems(p=>p.filter(x=>x._id!==id));toast.success('Post deleted')}catch(e){toast.error(e?.response?.data?.message||'Delete failed')}}
 const input=(key,label,type='text',required=false)=><label className="block space-y-1.5" key={key}><span className="text-xs font-medium text-slate-400">{label}{required?' *':''}</span><input className={fieldClass} type={type} required={required} value={form[key]} onChange={e=>set(key,e.target.value)} placeholder={label}/></label>
 const textarea=(key,label,required=false)=><label className="block space-y-1.5" key={key}><span className="text-xs font-medium text-slate-400">{label}{required?' *':''}</span><textarea className={fieldClass} rows={4} required={required} value={form[key]} onChange={e=>set(key,e.target.value)} placeholder={label}/></label>
 const upload=(label,required=false)=><label className="block space-y-1.5"><span className="text-xs font-medium text-slate-400">{label}{required?' *':''}</span><input type="file" accept="image/*" required={required} onChange={e=>setFile(e.target.files?.[0]||null)} className="block w-full text-sm text-slate-300 file:mr-3 file:rounded-lg file:border-0 file:bg-[#a8c49a]/15 file:px-3 file:py-2 file:text-[#c5dcb8]"/></label>
 const heading=sectionLabels[section]||nav.find(x=>x[0]===section)?.[1]||'Faculty Workspace'
 const makeForm=()=>section==='events'?<>{input('title','Event title','text',true)}{textarea('description','Event description',true)}{input('date','Date and time','datetime-local',true)}{input('venue','Venue','text',true)}{input('url','Registration link','url')}{upload('Event poster (optional)')}</>:section==='gallery'?<>{textarea('caption','Photo caption',true)}{upload('Upload campus image',true)}</>:section==='study'?<>{input('title','Resource title','text',true)}{input('subject','Subject / research area','text',true)}{textarea('description','Description',true)}{input('category','Resource type (Notes / Video / Assignment)')}{input('url','Study material URL','url')}{input('institute','Institute')}{input('department','Department')}</>:section==='placements'?<>{input('title','Job / opportunity title','text',true)}{input('category','Company / organization','text',true)}{input('subject','Role / eligible branch')}{input('destination','Location')}{input('date','Application deadline','date')}{textarea('description','Eligibility and opportunity details',true)}{input('url','Application link','url',true)}{input('institute','Institute / recruiter')}</>:section==='publications'?<>{input('title','Publication title','text',true)}{textarea('description','Abstract / summary',true)}{input('category','Publication type (Journal / Conference / Patent)')}{input('url','DOI / publication link','url')}{input('institute','Institute')}{input('department','Department')}</>:<>{input('title','Travel / conference title','text',true)}{input('from','Departure location','text',true)}{input('destination','Destination','text',true)}{input('date','Travel date','date',true)}{textarea('description','Travel / collaboration details',true)}{input('url','Conference or itinerary link','url')}</>
 const fmtDate=x=>x?new Date(x).toLocaleString('en-IN',{dateStyle:'medium',timeStyle:x.includes('T')?'short':undefined}):'Shared recently'
 return <PortalShell><main className="sage-page-theme mx-auto w-full max-w-[1440px] space-y-6">
  <section className="page-hero relative overflow-hidden rounded-3xl border border-[#a8c49a]/20 bg-[radial-gradient(ellipse_at_85%_5%,rgba(115,145,105,.22),transparent_38%),linear-gradient(120deg,#1b2820,#26382c_58%,#1b2a23)] p-6 md:p-8"><div className="flex flex-wrap items-end justify-between gap-4"><div><div className="mb-3 inline-flex rounded-full border border-[#a8c49a]/20 bg-[#a8c49a]/10 px-3 py-1.5 text-[10px] font-bold tracking-[.16em] text-[#b6d0a8]">FACULTY WORKSPACE</div><h1 className="text-3xl font-bold text-[#f0f1e8]">{section==='home'?'Faculty Home':heading}</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-[#c1cbbd]">{section==='home'?'Your full faculty portal for academic collaboration and sharing.':'Create, upload, manage and view your faculty contributions.'}</p></div>{section!=='home'&&section!=='news'&&<button onClick={load} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-xs font-semibold"><RefreshCw size={14} className={loading?'animate-spin':''}/> Refresh</button>}</div></section>
  {section==='home'?<><section className={cardClass}><h2 className="text-xl font-semibold">Welcome, {facultyName}</h2><p className="mt-2 text-sm text-slate-400">{user?.facultyProfile?.institute||'Faculty network'} · {user?.facultyProfile?.department||'Academic collaboration'}</p><p className="mt-3 text-sm leading-6 text-slate-400">Use the same portal experience as the student side, with faculty-only posts, uploads and community content.</p></section><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{nav.slice(1).map(([key,label,Icon])=><Link key={key} to={'/faculty/'+key} className={cardClass+' flex items-center gap-3 transition hover:-translate-y-0.5 hover:border-[#a8c49a]/35'}><Icon className="text-[#b6d0a8]"/><span className="font-semibold">{label}</span></Link>)}</div></>:section==='news'?<div className={cardClass}><p className="text-sm text-slate-300">Campus News uses the shared News page and its live feed, just like the Students portal.</p><Link className="mt-3 inline-flex text-sm font-semibold text-[#b6d0a8]" to="/faculty/news">Open News & Updates →</Link></div>:<div className="grid gap-5 lg:grid-cols-[minmax(320px,.8fr)_minmax(0,1.2fr)]">
   <form onSubmit={submit} className={cardClass+' space-y-4'}><div><h2 className="text-lg font-semibold">Create {heading.toLowerCase()} post</h2><p className="mt-1 text-xs text-slate-500">Fields marked * are required. Uploaded media is stored securely.</p></div>{section==='community'?<><textarea className={fieldClass} rows={5} required maxLength={2000} value={message} onChange={e=>setMessage(e.target.value)} placeholder="Message verified faculty colleagues…"/><button disabled={busy} className="inline-flex items-center gap-2 rounded-xl bg-[#a8c49a] px-4 py-3 text-sm font-bold text-[#111810] disabled:opacity-50"><Send size={15}/>{busy?'Sending…':'Send message'}</button></>:<>{makeForm()}<button disabled={busy} className="inline-flex items-center gap-2 rounded-xl bg-[#a8c49a] px-4 py-3 text-sm font-bold text-[#111810] disabled:opacity-50"><Upload size={15}/>{busy?'Saving…':'Share with faculty'}</button></>}</form>
   <section className="space-y-3"><div className="flex items-center justify-between"><h2 className="text-lg font-semibold">{section==='community'?'Faculty community':'Your faculty '+heading.toLowerCase()}</h2><span className="text-xs text-slate-500">{section==='community'?messages.length:items.length} entries</span></div>{loading?<div className={cardClass+' text-sm text-slate-400'}>Loading…</div>:section==='community'?messages.map(x=><article key={x._id} className={cardClass}><p className="text-xs text-[#b6d0a8]">{x.name||'Faculty colleague'} · {fmtDate(x.createdAt)}</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-200">{x.text}</p></article>):items.map(x=><article key={x._id} className={cardClass}><div className="flex items-start justify-between gap-3"><div><p className="text-xs text-[#b6d0a8]">{x.status||'Faculty post'} · {fmtDate(x.date||x.createdAt)}</p><h3 className="mt-2 font-semibold">{x.title||x.description||'Faculty gallery post'}</h3></div><button title="Delete my post" onClick={()=>remove(x._id)} className="rounded-lg border border-white/10 p-2 text-slate-400 hover:text-red-300"><Trash2 size={15}/></button></div>{x.mediaUrl&&<img src={x.mediaUrl} alt={x.title||'Faculty uploaded media'} className="mt-3 max-h-72 w-full rounded-xl object-cover"/>}{x.description&&x.title&&<p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-400">{x.description}</p>}{(x.subject||x.category||x.institute||x.department||x.venue||x.from||x.destination)&&<p className="mt-3 text-xs text-slate-500">{[x.subject,x.category,x.institute,x.department,x.venue,x.from&&'From '+x.from,x.destination&&'To '+x.destination].filter(Boolean).join(' · ')}</p>}{x.url&&<a href={x.url} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 break-all text-xs text-[#b6d0a8] underline"><ExternalLink size={13}/>{x.url}</a>}</article>)}{!loading&&!(section==='community'?messages:items).length&&<div className={cardClass+' text-sm text-slate-500'}>Nothing shared yet. Create the first faculty contribution using the form.</div>}</section>
  </div>}
 </main></PortalShell>
}
