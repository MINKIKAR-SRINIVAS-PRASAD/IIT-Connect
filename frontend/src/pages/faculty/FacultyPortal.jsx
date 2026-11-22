import React, { useEffect, useState } from 'react'
import { api } from '../../utils/api'
import { useAuth } from '../../hooks/useAuth'
import Button from '../../components/common/Button'
import toast from 'react-hot-toast'
import { Home, MessageCircle, BookOpen, FileText, Image as ImageIcon, CalendarDays, BriefcaseBusiness, Users, LogOut, Plane, Newspaper, RefreshCw, Sparkles } from 'lucide-react'

const nav = [
  { id: 'home', label: 'Faculty Home', icon: Home },
  { id: 'chat', label: 'Chat & Community', icon: MessageCircle },
  { id: 'study', label: 'Study Hub', icon: BookOpen },
  { id: 'publications', label: 'Publications', icon: FileText },
  { id: 'gallery', label: 'Gallery', icon: ImageIcon },
  { id: 'events', label: 'Events', icon: CalendarDays },
  { id: 'placement', label: 'Placement', icon: BriefcaseBusiness },
  { id: 'directory', label: 'Faculty Directory', icon: Users }
]

const sectionMeta = {
  home: ['Faculty workspace', 'Faculty Home', 'Your dedicated space for academic collaboration and campus updates.'],
  chat: ['Faculty community', 'Chat & Community', 'Connect and exchange ideas with fellow faculty members.'],
  study: ['Academic resources', 'Study Hub', 'Browse shared teaching and learning resources.'],
  publications: ['Research workspace', 'Publications', 'Share research, papers and scholarly contributions.'],
  gallery: ['Campus moments', 'Gallery', 'Explore and contribute to the shared campus gallery.'],
  events: ['Faculty events', 'Events', 'Research, academic exchange and professional collaboration.'],
  placement: ['Career collaboration', 'Placement', 'Share placement updates and opportunities.'],
  directory: ['People & network', 'Faculty Directory', 'Find faculty members across the network.']
}

export default function FacultyPortal() {
  const { user, logout } = useAuth()
  const [section, setSection] = useState('home')
  const [posts, setPosts] = useState([])
  const [messages, setMessages] = useState([])
  const [directory, setDirectory] = useState([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [link, setLink] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(false)

  async function load() {
    setLoading(true)
    try {
      if (section === 'chat') {
        const { data } = await api.get('/faculty/community')
        setMessages(data.messages || [])
      } else if (['publications', 'placement', 'study', 'events', 'gallery'].includes(section)) {
        const { data } = await api.get('/faculty/posts', { params: { section } })
        setPosts(data.posts || [])
      else if (section === 'directory') {
        const { data } = await api.get('/faculty/directory')
        setDirectory(data.faculty || [])
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Could not load faculty section')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!['chat', 'study', 'publications', 'placement', 'events', 'gallery', 'directory'].includes(section)) return
    load()
    if (section !== 'chat') return
    const refresh = window.setInterval(() => {
      api.get('/faculty/community').then(({ data }) => setMessages(data.messages || [])).catch(() => {})
    }, 12000)
    return () => window.clearInterval(refresh)
  }, [section])

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    try {
      if (section === 'chat') {
        await api.post('/faculty/community', { text: message })
        setMessage('')
      } else {
        await api.post('/faculty/posts', { section, title, description, link })
        setTitle('')
        setDescription('')
        setLink('')
      }
      await load()
      toast.success('Added successfully')
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Unable to submit')
    } finally {
      setBusy(false)
    }
  }

  const createSection = ['publications', 'placement', 'study', 'events', 'gallery'].includes(section)
  const meta = sectionMeta[section] || sectionMeta.home
  const displayName = user?.profile?.name || user?.email || 'Faculty member'

  const pageHeading = (icon, title, subtitle) => (
    <div className="relative overflow-hidden rounded-3xl border border-emerald-900/40 bg-gradient-to-br from-emerald-950/55 via-slate-900/80 to-slate-950 p-6 md:p-8">
      <div className="absolute -right-12 -top-16 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="relative flex items-center gap-4">
        <div className="rounded-2xl border border-emerald-800/50 bg-emerald-500/10 p-3 text-emerald-300">{icon}</div>
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-emerald-200/70">Faculty workspace</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-white md:text-3xl">{title}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300 md:text-base">{subtitle}</p>
        </div>
      </div>
    </div>
  )

  const card = 'rounded-2xl border border-slate-800/90 bg-slate-900/55 p-5 shadow-sm shadow-black/10'
  const field = 'w-full rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-900/40'

  return (
    <div className="min-h-screen bg-[#0b110e] text-slate-100">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 shrink-0 flex-col border-r border-white/5 bg-[#101813] md:flex">
          <div className="flex items-center gap-3 px-6 py-7">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-800/50 bg-emerald-500/10 text-sm font-black text-emerald-300">IIT</div>
            <div>
              <div className="text-base font-bold tracking-tight"><span className="text-white">IIT</span><span className="text-emerald-300">Connect</span></div>
              <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">The Faculty Network</p>
            </div>
          </div>
          <div className="px-5 pb-3 pt-2 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-600">Workspace</div>
          <nav className="space-y-1 px-3">
            {nav.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setSection(id)} className={'flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left text-sm font-medium transition ' + (section === id ? 'border-emerald-900/60 bg-emerald-900/25 text-emerald-100 shadow-inner shadow-emerald-950/30' : 'border-transparent text-slate-400 hover:border-white/5 hover:bg-white/[0.03] hover:text-slate-200')}>
                <Icon size={18} className={section === id ? 'text-emerald-300' : 'text-slate-500'} />
                <span>{label}</span>
              </button>
            ))}
          </nav>
          <div className="mt-auto p-4">
            <div className="rounded-2xl border border-blue-900/40 bg-gradient-to-br from-blue-950/80 to-slate-900 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-300 font-bold text-slate-950">{displayName.charAt(0).toUpperCase()}</div>
                <div className="min-w-0"><p className="truncate text-sm font-semibold text-white">{displayName}</p><p className="truncate text-xs text-slate-400">{user?.profile?.iit || 'Faculty account'}</p></div>
              </div>
              <div className="mt-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-emerald-400"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Connected community</div>
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 border-b border-white/5 bg-[#101813]/90 backdrop-blur-xl">
            <div className="flex min-h-[68px] items-center justify-between gap-4 px-4 md:px-8">
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500"><span>IIT Connect</span><span className="text-slate-700">›</span><span className="truncate text-slate-400">{meta[1]}</span></div>
                <div className="mt-1 flex items-center gap-2 text-sm font-semibold text-slate-100"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />{meta[1]}</div>
              </div>
              <div className="flex shrink-0 items-center gap-2 md:gap-3">
                <span className="hidden rounded-full border border-emerald-900/50 bg-emerald-950/40 px-4 py-2 text-xs text-emerald-100/80 sm:inline-block">{user?.profile?.iit || 'Faculty Network'}</span>
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-sm font-semibold">{displayName.charAt(0).toUpperCase()}</span>
                <button onClick={logout} className="flex items-center gap-2 rounded-xl border border-slate-800 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-slate-700 hover:bg-white/5"><LogOut size={15} /><span className="hidden sm:inline">Sign out</span></button>
              </div>
            </div>
          </header>

          <div className="border-b border-white/5 bg-[#101813] px-3 py-2 md:hidden">
            <nav className="flex gap-2 overflow-x-auto pb-1">
              {nav.map(({ id, label }) => <button key={id} onClick={() => setSection(id)} className={'shrink-0 rounded-lg px-3 py-2 text-xs font-medium ' + (section === id ? 'bg-emerald-900/40 text-emerald-200' : 'text-slate-400')}>{label}</button>)}
            </nav>
          </div>

          <main className="mx-auto max-w-[1600px] space-y-6 p-4 md:p-8">
            {pageHeading(<Sparkles size={25} />, meta[1], meta[2])}

            {section === 'home' && (
              <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {nav.filter(item => item.id !== 'home').map(({ id, label, icon: Icon }) => (
                  <button key={id} onClick={() => setSection(id)} className="group rounded-2xl border border-slate-800 bg-slate-900/45 p-5 text-left transition hover:-translate-y-0.5 hover:border-emerald-900/60 hover:bg-emerald-950/20">
                    <div className="flex items-center justify-between"><div className="rounded-xl border border-emerald-900/40 bg-emerald-500/10 p-2.5 text-emerald-300"><Icon size={20} /></div><span className="text-slate-600 transition group-hover:text-emerald-300">↗</span></div>
                    <h2 className="mt-4 font-semibold text-slate-100">{label}</h2><p className="mt-1 text-sm leading-6 text-slate-400">Open your faculty {label.toLowerCase()} workspace.</p>
                  </button>
                ))}
              </section>
            )}

            {section === 'gallery' && <section className={card + ' space-y-3'}><h2 className="text-lg font-semibold">Faculty gallery</h2><p className="text-sm text-slate-400">Faculty-only campus moments and images.</p>{posts.map(p => <article key={p._id} className="rounded-xl border border-slate-800 p-4"><h3 className="font-semibold">{p.title}</h3><p className="mt-2 whitespace-pre-wrap text-sm text-slate-300">{p.description}</p>{p.link && <a href={p.link} target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm text-emerald-300 underline">View media</a>}</article>)}{!loading && !posts.length && <p className="text-sm text-slate-500">No faculty gallery posts yet.</p>}</section>}
            {section === 'events' && <section className={card + ' space-y-3'}><h2 className="text-lg font-semibold">Faculty events</h2><p className="text-sm text-slate-400">Academic events shared within the faculty network.</p>{posts.map(p => <article key={p._id} className="rounded-xl border border-slate-800 p-4"><h3 className="font-semibold">{p.title}</h3><p className="mt-2 whitespace-pre-wrap text-sm text-slate-300">{p.description}</p>{p.link && <a href={p.link} target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm text-emerald-300 underline">Event details</a>}</article>)}{!loading && !posts.length && <p className="text-sm text-slate-500">No faculty events yet.</p>}</section>}

            {section === 'study' && <section className="space-y-4"><div className={card}><h2 className="text-lg font-semibold">Faculty Study Hub</h2><p className="mt-1 text-sm text-slate-400">Faculty resources kept separate from the student Study Hub.</p></div>{loading && <p className="text-sm text-slate-500">Loading resources…</p>}{posts.map(p => <article key={p._id} className={card}><h3 className="font-semibold">{p.title}</h3><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-300">{p.description}</p>{p.link && <a href={p.link} target="_blank" rel="noreferrer" className="mt-3 inline-block text-sm text-emerald-300 underline">Open resource</a>}</article>)}{!loading && !posts.length && <div className={card + ' text-sm text-slate-500'}>No approved study resources available yet.</div>}</section>}

            {createSection && <section className="grid items-start gap-5 xl:grid-cols-[minmax(320px,0.85fr)_minmax(0,1.15fr)]"><form onSubmit={submit} className={card + ' space-y-4'}><div><h2 className="text-lg font-semibold">Create {section === 'publications' ? 'publication' : section === 'placement' ? 'placement update' : section === 'study' ? 'study resource' : section === 'events' ? 'faculty event' : 'gallery post'}</h2><p className="mt-1 text-sm text-slate-400">Your contribution will appear in the faculty feed.</p></div><label className="block text-xs font-medium text-slate-400">Title<input required value={title} onChange={e => setTitle(e.target.value)} placeholder={section === 'publications' ? 'Publication title' : section === 'placement' ? 'Placement update title' : section === 'study' ? 'Resource title' : section === 'events' ? 'Event title' : 'Gallery caption'} className={field + ' mt-2'} /></label><label className="block text-xs font-medium text-slate-400">Details<textarea required value={description} onChange={e => setDescription(e.target.value)} placeholder="Abstract, details, eligibility or information" rows={5} className={field + ' mt-2 resize-y'} /></label><label className="block text-xs font-medium text-slate-400">Reference link (optional)<input value={link} onChange={e => setLink(e.target.value)} placeholder="DOI / paper / official link" className={field + ' mt-2'} /></label><Button disabled={busy}>{busy ? 'Submitting…' : 'Publish contribution'}</Button></form><div className="space-y-3"><div className={card + ' flex items-center justify-between'}><div><h2 className="font-semibold">Faculty contributions</h2><p className="mt-1 text-sm text-slate-400">Latest shared posts</p></div><button onClick={load} className="rounded-xl border border-slate-700 p-2 text-slate-400 hover:text-emerald-300" aria-label="Refresh"><RefreshCw size={17} /></button></div>{loading && <p className="px-2 text-sm text-slate-500">Loading posts…</p>}{posts.map(p => <article key={p._id} className={card}><h3 className="font-semibold">{p.title}</h3><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-300">{p.description}</p>{p.link && <a href={p.link} target="_blank" rel="noreferrer" className="mt-3 inline-block text-sm text-emerald-300 underline">Open link</a>}<p className="mt-4 text-xs text-slate-500">{p.facultyId?.profile?.name || p.facultyId?.email || 'Faculty member'}</p></article>)}{!loading && !posts.length && <div className={card + ' text-sm text-slate-500'}>No contributions posted yet.</div>}</div></section>}

            {section === 'chat' && <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]"><div className={card + ' flex min-h-[65vh] flex-col'}><div className="mb-4 border-b border-slate-800 pb-4"><h2 className="font-semibold">Faculty Community</h2><p className="mt-1 text-sm text-slate-400">A discussion space for faculty accounts.</p></div><div className="flex-1 space-y-3">{loading && <p className="text-sm text-slate-500">Loading conversation…</p>}{messages.map(m => <article key={m._id} className="max-w-3xl rounded-xl border border-slate-800 bg-slate-950/60 p-4"><p className="text-xs font-semibold text-emerald-300">{m.name}</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-200">{m.text}</p></article>)}</div><form onSubmit={submit} className="mt-5 flex gap-2 border-t border-slate-800 pt-4"><input required value={message} onChange={e => setMessage(e.target.value)} placeholder="Write to the faculty community…" className={field + ' min-w-0 flex-1'} /><Button disabled={busy}>{busy ? 'Sending…' : 'Send'}</Button></form></div><aside className={card + ' h-fit'}><MessageCircle size={22} className="text-emerald-300" /><h3 className="mt-3 font-semibold">Faculty-only space</h3><p className="mt-2 text-sm leading-6 text-slate-400">Use this community to discuss academic work, announcements and collaboration.</p></aside></section>}

            {section === 'directory' && <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{loading && <p className="text-sm text-slate-500">Loading directory…</p>}{directory.map(f => <article key={f._id} className={card}><div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-900/40 font-semibold text-emerald-200">{(f.profile?.name || f.email || 'F').charAt(0).toUpperCase()}</div><div className="min-w-0"><h3 className="truncate font-semibold">{f.profile?.name || f.email}</h3><p className="mt-1 text-xs text-slate-400">{f.profile?.branch || 'Faculty'} · {f.profile?.iit || ''}</p></div></div><p className="mt-4 break-all text-sm text-slate-400">{f.email}</p></article>)}{!loading && !directory.length && <div className={card + ' text-sm text-slate-500'}>Faculty directory is empty.</div>}</section>}
          </main>
        </div>
      </div>
    </div>
  )
}
