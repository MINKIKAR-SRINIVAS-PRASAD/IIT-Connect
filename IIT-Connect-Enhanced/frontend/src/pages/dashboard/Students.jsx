import React, { useEffect, useState } from 'react'
import { Search, UserPlus, Check, Clock, Building2, UserRound } from 'lucide-react'
import toast from 'react-hot-toast'
import { api } from '../../utils/api'
import StudentProfilePreview from '../../components/chat/StudentProfilePreview.jsx'

export default function Students() {
  const [query, setQuery] = useState('')
  const [users, setUsers] = useState([])
  const [requests, setRequests] = useState({ incoming: [], outgoing: [], connections: [] })
  const [loading, setLoading] = useState(false)
  const [busy, setBusy] = useState('')
  const [profileUserId, setProfileUserId] = useState('')

  async function load() {
    setLoading(true)
    try {
      const [userResponse, requestResponse] = await Promise.all([
        api.get('/chat/users', { params: { q: query.trim() } }),
        api.get('/chat/requests')
      ])
      setUsers((userResponse.data.users || []).filter(person => person.role ? person.role === 'student' : true).map(person => ({ ...person, _id: person._id || person.id })))
      setRequests({
        incoming: requestResponse.data.incoming || [],
        outgoing: requestResponse.data.outgoing || [],
        connections: requestResponse.data.connections || []
      })
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Could not load students')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => load(), 300)
    return () => clearTimeout(timer)
  }, [query])

  async function connect(id) {
    setBusy(id)
    try {
      const { data } = await api.post('/chat/connect/' + id)
      toast.success(data.status === 'accepted' ? 'Connection accepted' : 'Connection request sent')
      await load()
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Could not send request')
    } finally {
      setBusy('')
    }
  }

  async function respond(id, action) {
    setBusy(id)
    try {
      await api.patch('/chat/requests/' + id, { action })
      toast.success(action === 'accept' ? 'Connection accepted' : 'Request declined')
      await load()
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Could not respond')
    } finally {
      setBusy('')
    }
  }

  const outgoing = new Set(requests.outgoing.map(row => String(row.recipient?._id || row.recipient)))
  const connected = new Set(requests.connections.map(row => String(row.user?._id || row.user)))
  const incomingByPerson = new Map(requests.incoming.map(row => [String(row.requester?._id), row]))

  return <div className="space-y-5 text-slate-100">
    <header>
      <p className="text-xs font-bold tracking-[.18em] text-emerald-300">CROSS-IIT STUDENT NETWORK</p>
      <h1 className="mt-2 text-3xl font-bold">Find students</h1>
      <p className="mt-2 text-sm text-slate-400">Search students and open their profiles. Private chat unlocks after a connection is accepted.</p>
    </header>
    <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[.04] px-4 py-3">
      <Search size={18} className="text-slate-400"/>
      <input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search name, roll number, IIT or branch…" className="w-full bg-transparent text-sm outline-none"/>
    </label>
    {requests.incoming.length > 0 && <section className="rounded-2xl border border-amber-300/20 bg-amber-300/[.04] p-4">
      <h2 className="font-semibold">Incoming requests ({requests.incoming.length})</h2>
      <div className="mt-3 space-y-2">{requests.incoming.map(row => <div key={row._id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-black/20 p-3">
        <span className="text-sm">{row.requester?.profile?.name || 'Student'} · {row.requester?.profile?.iit || row.requester?.profile?.institute || 'Institute'}</span>
        <div className="flex gap-2"><button disabled={!!busy} onClick={() => respond(row._id, 'accept')} className="rounded-lg bg-emerald-300 px-3 py-1.5 text-xs font-bold text-black">Accept</button><button disabled={!!busy} onClick={() => respond(row._id, 'reject')} className="rounded-lg border border-white/10 px-3 py-1.5 text-xs">Decline</button></div>
      </div>)}</div>
    </section>}
    <section className="grid gap-3 sm:grid-cols-2">
      {loading ? <p className="text-sm text-slate-400">Searching…</p> : users.map(person => {
        const id = String(person._id)
        const isConnected = connected.has(id)
        const isPending = outgoing.has(id)
        const incoming = incomingByPerson.get(id)
        return <article key={id} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[.035] p-4">
          <button type="button" onClick={() => setProfileUserId(id)} aria-label={'Open ' + (person.profile?.name || 'student') + ' profile'} className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-emerald-300/10 text-lg font-bold text-emerald-200">
            {person.profile?.photoUrl ? <img src={person.profile.photoUrl} alt="" className="h-full w-full object-cover"/> : (person.profile?.name || '?').slice(0, 1)}
          </button>
          <div className="min-w-0 flex-1">
            <button type="button" onClick={() => setProfileUserId(id)} className="block max-w-full truncate text-left font-semibold hover:text-emerald-200">{person.profile?.name || 'Student'} <span className="ml-1 inline-flex align-middle text-slate-500"><UserRound size={13}/></span></button>
            <div className="mt-1 flex items-center gap-1 truncate text-xs text-slate-400"><Building2 size={12}/>{person.profile?.iit || person.profile?.institute || 'Institute not set'}{person.profile?.branch ? ' · ' + person.profile.branch : ''}</div>
            {person.profile?.rollNumber && <div className="mt-1 truncate text-[11px] text-slate-500">{person.profile.rollNumber}</div>}
            <button type="button" onClick={() => setProfileUserId(id)} className="mt-1 text-xs text-emerald-300 hover:underline">View profile</button>
          </div>
          {isConnected ? <span className="flex items-center gap-1 text-xs text-emerald-300"><Check size={14}/>Connected</span> : incoming ? <button disabled={!!busy} onClick={() => respond(incoming._id, 'accept')} className="rounded-xl bg-emerald-300 px-3 py-2 text-xs font-bold text-black">Accept</button> : isPending ? <span className="flex items-center gap-1 text-xs text-amber-200"><Clock size={14}/>Pending</span> : <button disabled={!!busy} onClick={() => connect(id)} className="flex items-center gap-1 rounded-xl border border-emerald-300/20 px-3 py-2 text-xs text-emerald-200"><UserPlus size={14}/>{busy === id ? '…' : 'Connect'}</button>}
        </article>
      })}
    </section>
    {!loading && !users.length && <p className="rounded-xl border border-white/10 p-5 text-sm text-slate-400">No students found. Try a name, roll number, institute or branch.</p>}
    {profileUserId && <StudentProfilePreview userId={profileUserId} onClose={() => setProfileUserId('')} onMessage={() => { toast('Connect first to message this student.'); setProfileUserId('') }}/>}
  </div>
}
