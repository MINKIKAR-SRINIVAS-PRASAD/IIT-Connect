import React, { useEffect, useState } from 'react'
import { api } from '../../utils/api'
import { useAuth } from '../../hooks/useAuth'
import Button from '../../components/common/Button'
import toast from 'react-hot-toast'

const sections = [{ id: 'event', label: 'Faculty Events' }, { id: 'gallery', label: 'Faculty Gallery' }, { id: 'study', label: 'Faculty Study Hub' }, { id: 'community', label: 'Faculty Community' }]
export default function FacultyPortal() {
  const { user, logout } = useAuth()
  const [section, setSection] = useState('event')
  const [posts, setPosts] = useState([])
  const [messages, setMessages] = useState([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [link, setLink] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  async function load() {
    try {
      if (section === 'community') { const { data } = await api.get('/faculty/community'); setMessages(data.messages || []) }
      else { const { data } = await api.get('/faculty/posts', { params: { section } }); setPosts(data.posts || []) }
    } catch (e) { toast.error(e?.response?.data?.message || 'Could not load faculty space') }
  }
  useEffect(() => { load() }, [section])
  async function submit(e) {
    e.preventDefault(); setBusy(true)
    try {
      if (section === 'community') { await api.post('/faculty/community', { text: message }); setMessage('') }
      else { await api.post('/faculty/posts', { section, title, description, imageUrl, link }); setTitle(''); setDescription(''); setImageUrl(''); setLink('') }
      await load(); toast.success('Published in faculty space')
    } catch (e) { toast.error(e?.response?.data?.message || 'Unable to publish') }
    finally { setBusy(false) }
  }
  return <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8"><header className="flex flex-wrap justify-between gap-4 items-center mb-8"><div><p className="text-xs uppercase tracking-widest text-slate-500">Private faculty workspace</p><h1 className="text-3xl font-bold mt-1">Faculty Connect</h1><p className="text-slate-400 mt-1">{user?.profile?.name || user?.email} · Faculty account</p></div><Button variant="ghost" onClick={logout}>Logout</Button></header><nav className="flex flex-wrap gap-2 mb-6">{sections.map(s=><button key={s.id} onClick={()=>setSection(s.id)} className={`rounded-xl px-4 py-2 border ${section===s.id?'border-slate-500 bg-slate-800 text-white':'border-slate-800 bg-slate-950 text-slate-400'}`}>{s.label}</button>)}</nav><form onSubmit={submit} className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 mb-6 space-y-3">{section==='community'?<textarea required value={message} onChange={e=>setMessage(e.target.value)} placeholder="Message faculty community" className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3"/>:<><input required value={title} onChange={e=>setTitle(e.target.value)} placeholder={section==='event'?'Event title':section==='gallery'?'Gallery caption':'Study resource title'} className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3"/><textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="Details" className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3"/><input value={imageUrl} onChange={e=>setImageUrl(e.target.value)} placeholder="Image URL (optional)" className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3"/><input value={link} onChange={e=>setLink(e.target.value)} placeholder="Resource / event link (optional)" className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3"/></>}<Button disabled={busy}>{busy?'Publishing…':section==='community'?'Send message':'Publish'}</Button></form>{section==='community'?<div className="space-y-3">{messages.map(m=><article key={m._id} className="rounded-xl border border-slate-800 p-4"><p className="text-sm text-slate-400">{m.name}</p><p className="mt-1">{m.text}</p></article>)}</div>:<div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">{posts.map(p=><article key={p._id} className="rounded-2xl border border-slate-800 bg-slate-900/30 p-4">{p.imageUrl&&<img src={p.imageUrl} alt="" className="rounded-xl w-full max-h-52 object-cover mb-3"/>}<h2 className="font-semibold text-lg">{p.title}</h2><p className="text-sm text-slate-400 mt-2 whitespace-pre-wrap">{p.description}</p>{p.link&&<a href={p.link} target="_blank" rel="noreferrer" className="inline-block text-slate-300 underline mt-3">Open link</a>}<p className="text-xs text-slate-600 mt-3">{p.facultyId?.profile?.name || p.facultyId?.email || 'Faculty'}</p></article>)}</div>}</div>
}
