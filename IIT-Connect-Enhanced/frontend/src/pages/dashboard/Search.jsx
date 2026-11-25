import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search as SearchIcon, MessageCircle, UserRound, Users } from 'lucide-react'
import toast from 'react-hot-toast'
import { api } from '../../utils/api'
import { useAuth } from '../../hooks/useAuth'

export default function Search() {
  const { user } = useAuth()
  const [query, setQuery] = useState('')
  const [people, setPeople] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const { data } = await api.get('/chat/users', { params: { q: query.trim() } })
        if (active) setPeople(Array.isArray(data.users) ? data.users : [])
      } catch (error) {
        if (active) {
          setPeople([])
          if (query.trim()) toast.error(error?.response?.data?.message || 'Student search failed')
        }
      } finally {
        if (active) setLoading(false)
      }
    }, 250)
    return () => { active = false; clearTimeout(timer) }
  }, [query])

  const currentId = String(user?._id || user?.id || '')
  const results = people.filter(person => String(person._id || person.id) !== currentId)

  return <div className="mx-auto w-full max-w-4xl space-y-6 pb-8">
    <section className="rounded-[28px] border border-white/10 bg-gradient-to-br from-[#263b30] to-[#17231d] p-6 md:p-9">
      <div className="inline-flex items-center gap-2 rounded-full border border-[#b9d1a8]/20 bg-black/10 px-3 py-1.5 text-[10px] font-bold tracking-[.16em] text-[#c5d8b7]"><SearchIcon size={14}/> IIT COMMUNITY SEARCH</div>
      <h1 className="mt-5 text-3xl font-semibold tracking-tight text-[#edf1e7] md:text-4xl">Find your people</h1>
      <p className="mt-3 max-w-xl text-sm leading-6 text-[#aab7a8]">Search students across the IIT network by name, roll number, institute or branch.</p>
      <label className="mt-6 flex items-center gap-3 rounded-2xl border border-white/10 bg-[#101711]/75 px-4 py-3.5">
        <SearchIcon size={20} className="shrink-0 text-[#a9c49a]"/>
        <input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search name, roll number, IIT, branch…" className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500" autoComplete="off"/>
      </label>
    </section>
    <div className="flex items-center justify-between"><div><p className="text-[10px] font-bold tracking-[.18em] text-[#9dbb8b]">STUDENT DIRECTORY</p><h2 className="mt-1 text-xl font-semibold text-slate-100">{query.trim() ? 'Search results' : 'Discover students'}</h2></div><span className="text-xs text-slate-500">{loading ? 'Searching…' : results.length + ' found'}</span></div>
    {loading ? <div className="rounded-2xl border border-white/10 p-6 text-sm text-slate-400">Finding students…</div> : results.length ? <div className="grid gap-3 sm:grid-cols-2">{results.map(person => {
      const profile = person.profile || {}
      const name = profile.name || person.name || 'IIT Student'
      return <article key={person._id || person.id} className="flex min-w-0 items-center gap-3 rounded-2xl border border-white/10 bg-white/[.035] p-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-[#26352a] text-sm font-semibold text-[#c7d9ba]">{profile.photoUrl ? <img src={profile.photoUrl} alt="" className="h-full w-full object-cover"/> : <UserRound size={21}/>}</div>
        <div className="min-w-0 flex-1"><h3 className="truncate text-sm font-semibold text-slate-100">{name}</h3><p className="mt-1 truncate text-xs text-slate-400">{[profile.iit, profile.branch].filter(Boolean).join(' · ') || 'IIT student'}</p>{profile.rollNumber && <p className="mt-1 truncate text-[11px] text-slate-500">{profile.rollNumber}</p>}</div>
        <Link to="/app/chat" className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-[#a8c49a]/20 px-3 py-2 text-xs font-medium text-[#c6d8b8] hover:bg-[#a8c49a]/10"><MessageCircle size={14}/> Chat</Link>
      </article>
    })}</div> : <div className="rounded-2xl border border-white/10 bg-white/[.025] p-7 text-center"><Users size={26} className="mx-auto text-slate-500"/><p className="mt-3 text-sm text-slate-300">{query.trim() ? 'No students match that search.' : 'No student directory results are available right now.'}</p><p className="mt-1 text-xs text-slate-500">Try a different name, institute or roll number.</p></div>}
  </div>
}
