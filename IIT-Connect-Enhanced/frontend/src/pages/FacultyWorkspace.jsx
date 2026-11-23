import React, { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation, Navigate } from 'react-router-dom'
import { BookOpen, CalendarDays, Images, Home, MessageSquare, Plane, FileText, LogOut, GraduationCap } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { api } from '../utils/api'
import toast from 'react-hot-toast'
import BrandSymbol from '../components/common/BrandSymbol'

const facultyLinks=[
  ['/faculty/home','Faculty Home',Home],
  ['/faculty/events','Events',CalendarDays],
  ['/faculty/gallery','Gallery',Images],
  ['/faculty/study','Study',BookOpen],
  ['/faculty/publications','Publications',FileText],
  ['/faculty/travel','Travel',Plane],
  ['/faculty/community','Chat & Community',MessageSquare]
]

function FacultyFrame({section}) {
  const {user,logout}=useAuth()
  const [items,setItems]=useState([])
  const [title,setTitle]=useState('')
  const [abstract,setAbstract]=useState('')
  const [institute,setInstitute]=useState(user?.facultyProfile?.institute||'')
  const [department,setDepartment]=useState(user?.facultyProfile?.department||'')
  const [kind,setKind]=useState('journal')
  const [busy,setBusy]=useState(false)
  async function load(){if(section==='publications'){try{const {data}=await api.get('/faculty/publications');setItems(data.publications||[])}catch(e){toast.error(e?.response?.data?.message||'Could not load faculty publications')}}}
  useEffect(()=>{load()},[section])
  async function publish(e){e.preventDefault();setBusy(true);try{await api.post('/faculty/publications',{title,abstract,institute,department,publicationType:kind});setTitle('');setAbstract('');toast.success('Publication added to faculty network');load()}catch(e){toast.error(e?.response?.data?.message||'Could not save publication')}finally{setBusy(false)}}
  const label=facultyLinks.find(x=>x[0].endsWith(section))?.[1]||'Faculty Network'
  return <div className="min-h-screen bg-[#090b12] text-slate-100 md:flex">
    <aside className="w-full border-b border-white/10 bg-[#10131d] p-5 md:sticky md:top-0 md:h-screen md:w-64 md:border-b-0 md:border-r">
      <div className="flex items-center gap-3"><BrandSymbol className="h-9 w-[66px] object-contain"/><div><div className="font-bold tracking-tight">IITProfessorsOS</div><div className="text-[10px] uppercase tracking-[.18em] text-amber-200/70">Faculty Workspace</div></div></div>
      <p className="mt-5 rounded-xl border border-amber-200/10 bg-amber-200/[.04] p-3 text-xs leading-5 text-slate-400">A dedicated professional community for faculty. Separate from the student network.</p>
      <nav className="mt-5 grid grid-cols-2 gap-2 md:grid-cols-1">{facultyLinks.map(([to,name,Icon])=><NavLink key={to} to={to} className={({isActive})=>`flex items-center gap-3 rounded-xl px-3 py-3 text-sm ${isActive?'bg-amber-200/10 text-amber-100':'text-slate-400 hover:bg-white/5 hover:text-white'}`}><Icon size={17}/>{name}</NavLink>)}</nav>
      <div className="mt-5 border-t border-white/10 pt-4"><div className="text-sm font-medium">{user?.facultyProfile?.name||user?.email}</div><div className="mt-1 text-xs text-slate-500">{user?.facultyProfile?.designation||'Verified Faculty'}</div><button onClick={async()=>{try{await logout()}finally{location.assign('/login')}}} className="mt-4 flex items-center gap-2 text-xs text-slate-400"><LogOut size={15}/>Sign out</button></div>
    </aside>
    <main className="min-w-0 flex-1 p-5 md:p-10"><div className="mx-auto max-w-5xl"><header className="mb-8 border-b border-white/10 pb-5"><p className="text-xs font-semibold uppercase tracking-[.2em] text-amber-200/70">Faculty workspace</p><h1 className="mt-2 text-3xl font-semibold">{label}</h1><p className="mt-2 text-sm text-slate-400">Research, exchange ideas, and connect with colleagues across institutes.</p></header>
    {section==='publications'?<div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]"><form onSubmit={publish} className="h-fit space-y-4 rounded-2xl border border-white/10 bg-white/[.025] p-5"><h2 className="text-lg font-semibold">Add a publication</h2><input required value={title} onChange={e=>setTitle(e.target.value)} placeholder="Publication title" className="w-full rounded-lg border border-white/10 bg-black/20 p-3 text-sm"/><textarea required minLength={20} value={abstract} onChange={e=>setAbstract(e.target.value)} placeholder="Abstract / summary" rows={5} className="w-full rounded-lg border border-white/10 bg-black/20 p-3 text-sm"/><input required value={institute} onChange={e=>setInstitute(e.target.value)} placeholder="Institute" className="w-full rounded-lg border border-white/10 bg-black/20 p-3 text-sm"/><input required value={department} onChange={e=>setDepartment(e.target.value)} placeholder="Department" className="w-full rounded-lg border border-white/10 bg-black/20 p-3 text-sm"/><select value={kind} onChange={e=>setKind(e.target.value)} className="w-full rounded-lg border border-white/10 bg-[#11131d] p-3 text-sm"><option value="journal">Journal</option><option value="conference">Conference</option><option value="book">Book</option><option value="patent">Patent</option><option value="preprint">Preprint</option><option value="other">Other</option></select><button disabled={busy} className="rounded-lg bg-amber-200 px-4 py-3 text-sm font-bold text-[#17140b] disabled:opacity-50">{busy?'Saving…':'Publish to faculty network'}</button></form><div className="space-y-3"><h2 className="text-lg font-semibold">Faculty publications</h2>{items.map(item=><article key={item._id} className="rounded-2xl border border-white/10 p-5"><div className="text-xs uppercase tracking-wider text-amber-200/70">{item.publicationType} · {item.institute} · {item.department}</div><h3 className="mt-2 font-semibold">{item.title}</h3><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-400">{item.abstract}</p><div className="mt-3 text-xs text-slate-500">{item.author?.facultyProfile?.name||'Faculty author'}</div></article>)}{!items.length&&<p className="rounded-xl border border-dashed border-white/10 p-6 text-sm text-slate-500">No publications shared yet. Add the first faculty research entry.</p>}</div></div>:section==='home'?<div className="grid gap-4 md:grid-cols-2"><div className="rounded-2xl border border-amber-200/15 bg-amber-200/[.04] p-6"><h2 className="text-xl font-semibold">Welcome to the faculty network</h2><p className="mt-2 text-sm leading-6 text-slate-400">A faculty-first space for academic exchange, professional community, research, and institute-wide collaboration.</p></div><div className="rounded-2xl border border-white/10 p-6"><h2 className="font-semibold">Your faculty profile</h2><p className="mt-2 text-sm text-slate-400">{user?.facultyProfile?.institute||'Institute'} · {user?.facultyProfile?.department||'Department'}</p></div></div>:<div className="rounded-2xl border border-white/10 bg-white/[.025] p-7"><h2 className="text-xl font-semibold">{label}</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">This section belongs exclusively to the verified faculty workspace. Its faculty-only content and conversations will be implemented against dedicated faculty data and permissions—not student feeds or student chats.</p><span className="mt-5 inline-flex rounded-full border border-amber-200/15 px-3 py-1 text-xs text-amber-100/70">Faculty-only section · Build in progress</span></div>}</div></main></div>
}

export default function FacultyWorkspace({section='home'}) {return <FacultyFrame section={section}/>}
