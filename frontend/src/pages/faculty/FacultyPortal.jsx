import React, { useEffect, useState } from 'react'
import { api } from '../../utils/api'
import { useAuth } from '../../hooks/useAuth'
import Button from '../../components/common/Button'
import toast from 'react-hot-toast'
import Gallery from '../dashboard/Gallery.jsx'
import Events from '../dashboard/Events.jsx'

const nav = [
  ['home','Home'], ['chat','Chat'], ['study','Study Hub'], ['publications','Publications'],
  ['gallery','Gallery'], ['events','Events'], ['placement','Placement'], ['directory','Faculty Directory']
]
const shared = new Set(['gallery','events','study'])

export default function FacultyPortal() {
  const { user, logout } = useAuth()
  const [section,setSection]=useState('home')
  const [posts,setPosts]=useState([])
  const [messages,setMessages]=useState([])
  const [directory,setDirectory]=useState([])
  const [title,setTitle]=useState('')
  const [description,setDescription]=useState('')
  const [link,setLink]=useState('')
  const [message,setMessage]=useState('')
  const [busy,setBusy]=useState(false)

  async function load() {
    try {
      if(section==='chat') {
        const {data}=await api.get('/faculty/community'); setMessages(data.messages||[])
      } else if(section==='publications'||section==='placement') {
        const {data}=await api.get('/faculty/posts',{params:{section}}); setPosts(data.posts||[])
      } else if(section==='study') {
        const {data}=await api.get('/study'); setPosts(data.posts||[])
      } else if(section==='directory') {
        const {data}=await api.get('/faculty/directory'); setDirectory(data.faculty||[])
      }
    } catch(e) { toast.error(e?.response?.data?.message||'Could not load faculty section') }
  }
  useEffect(()=>{ if(['chat','study','publications','placement','directory'].includes(section)) load() },[section])

  async function submit(e) {
    e.preventDefault(); setBusy(true)
    try {
      if(section==='chat') {
        await api.post('/faculty/community',{text:message}); setMessage('')
      } else {
        await api.post('/faculty/posts',{section,title,description,link})
        setTitle('');setDescription('');setLink('')
      }
      await load();toast.success('Added successfully')
    } catch(e) {toast.error(e?.response?.data?.message||'Unable to submit')}
    finally {setBusy(false)}
  }

  const createSection=['publications','placement'].includes(section)
  return <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8">
    <header className="flex flex-wrap justify-between items-center gap-4 mb-7">
      <div><p className="text-xs uppercase tracking-widest text-slate-500">Faculty workspace</p><h1 className="text-3xl font-bold mt-1">Faculty Connect</h1><p className="text-slate-400 mt-1">{user?.profile?.name||user?.email}</p></div>
      <Button variant="ghost" onClick={logout}>Logout</Button>
    </header>
    <nav className="flex flex-wrap gap-2 mb-7">{nav.map(([id,label])=><button key={id} onClick={()=>setSection(id)} className={`rounded-xl px-4 py-2 border ${section===id?'border-slate-500 bg-slate-800 text-white':'border-slate-800 text-slate-400 hover:bg-slate-900'}`}>{label}</button>)}</nav>

    {section==='home'&&<section className="space-y-5">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6"><h2 className="text-2xl font-semibold">Welcome to Faculty Connect</h2><p className="text-slate-400 mt-2">A dedicated faculty workspace for academic collaboration, publications and placement updates.</p></div>
      <div className="grid md:grid-cols-3 gap-4">{[['Chat','Faculty-only discussion space'],['Study Hub','Shared academic resources'],['Publications','Faculty research and papers'],['Gallery','Shared campus gallery'],['Events','Shared campus events'],['Placement','Faculty placement updates']].map(([t,d])=><button key={t} onClick={()=>setSection(({Chat:'chat','Study Hub':'study',Publications:'publications',Gallery:'gallery',Events:'events',Placement:'placement'})[t]||'home')} className="text-left rounded-xl border border-slate-800 bg-slate-900/30 p-5 hover:bg-slate-900"><h3 className="font-semibold">{t}</h3><p className="text-sm text-slate-400 mt-1">{d}</p></button>)}</div>
    </section>}

    {section==='gallery'&&<Gallery/>}
    {section==='events'&&<Events/>}

    {section==='study'&&<section className="space-y-4"><div className="rounded-2xl border border-slate-800 p-5"><h2 className="text-xl font-semibold">Study Hub · Shared</h2><p className="text-sm text-slate-400">Resources from the common Study Hub feed.</p></div>{posts.map(p=><article key={p._id} className="rounded-xl border border-slate-800 p-4"><h3 className="font-semibold">{p.title}</h3><p className="text-sm text-slate-400 whitespace-pre-wrap mt-2">{p.description}</p>{p.link&&<a href={p.link} target="_blank" rel="noreferrer" className="underline text-slate-300 mt-2 inline-block">Open resource</a>}</article>)}{!posts.length&&<p className="text-slate-500">No approved study resources available yet.</p>}</section>}

    {createSection&&<section className="space-y-5"><form onSubmit={submit} className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 space-y-3"><h2 className="text-xl font-semibold">Faculty {section==='publications'?'Publications':'Placement'}</h2><input required value={title} onChange={e=>setTitle(e.target.value)} placeholder={section==='publications'?'Publication title':'Placement update title'} className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3"/><textarea required value={description} onChange={e=>setDescription(e.target.value)} placeholder="Abstract, details, eligibility or information" className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3"/><input value={link} onChange={e=>setLink(e.target.value)} placeholder="DOI / paper / official link (optional)" className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3"/><Button disabled={busy}>{busy?'Submitting…':'Publish'}</Button></form><div className="grid md:grid-cols-2 gap-4">{posts.map(p=><article key={p._id} className="rounded-xl border border-slate-800 bg-slate-900/30 p-4"><h3 className="font-semibold">{p.title}</h3><p className="text-sm text-slate-400 whitespace-pre-wrap mt-2">{p.description}</p>{p.link&&<a href={p.link} target="_blank" rel="noreferrer" className="underline text-slate-300 mt-2 inline-block">Open link</a>}<p className="text-xs text-slate-600 mt-3">{p.facultyId?.profile?.name||p.facultyId?.email||'Faculty'}</p></article>)}</div></section>}

    {section==='chat'&&<section className="space-y-4"><form onSubmit={submit} className="flex gap-2"><input required value={message} onChange={e=>setMessage(e.target.value)} placeholder="Message faculty community…" className="flex-1 rounded-xl bg-slate-900 border border-slate-800 p-3"/><Button disabled={busy}>Send</Button></form><div className="space-y-3">{messages.map(m=><article key={m._id} className="rounded-xl border border-slate-800 p-4"><p className="text-xs text-slate-500">{m.name}</p><p className="mt-1">{m.text}</p></article>)}</div></section>}

    {section==='directory'&&<section className="grid md:grid-cols-2 gap-4">{directory.map(f=><article key={f._id} className="rounded-xl border border-slate-800 p-4"><h3 className="font-semibold">{f.profile?.name||f.email}</h3><p className="text-sm text-slate-400">{f.profile?.branch||'Faculty'} · {f.profile?.iit||''}</p><p className="text-sm text-slate-400 mt-2">{f.email}</p></article>)}{!directory.length&&<p className="text-slate-500">Faculty directory is empty.</p>}</section>}
  </div>
}
