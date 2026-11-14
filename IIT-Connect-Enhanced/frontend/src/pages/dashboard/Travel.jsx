import React, { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { api } from '../../utils/api'

const initialForm = {
  travelMode: 'Train',
  travelDate: '',
  from: '',
  to: '',
  notes: '',
  contactPreference: 'Email',
  seatDetails: ''
}

export default function Travel() {
  const [posts, setPosts] = useState([])
  const [mine, setMine] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')
  const [form, setForm] = useState(initialForm)

  async function loadTravel() {
    setLoading(true)
    try {
      const [publicResult, mineResult] = await Promise.all([
        api.get('/travel'),
        api.get('/travel/mine')
      ])
      setPosts(publicResult.data.posts || [])
      setMine(mineResult.data.posts || [])
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Could not load travel plans')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadTravel() }, [])

  const filteredPosts = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return posts
    return posts.filter((post) =>
      [post.from, post.to, post.travelMode, post.iit, post.authorId?.profile?.name]
        .filter(Boolean).some((value) => String(value).toLowerCase().includes(query))
    )
  }, [posts, search])

  function updateForm(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  async function submitTravel(event) {
    event.preventDefault()
    if (!form.travelDate || !form.from.trim() || !form.to.trim()) {
      toast.error('Please enter a travel date, origin and destination')
      return
    }
    setSaving(true)
    try {
      await api.post('/travel', form)
      toast.success('Travel plan submitted for admin approval')
      setForm(initialForm)
      setShowForm(false)
      await loadTravel()
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Could not submit travel plan')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 text-white">
      <section className="rounded-3xl border border-indigo-900/50 bg-gradient-to-r from-indigo-950 via-slate-950 to-purple-950 p-6 md:p-8">
        <p className="mb-2 text-sm font-semibold text-indigo-300">✈ IIT Connect Travel</p>
        <h1 className="text-3xl font-bold md:text-4xl">Travel together. Connect across IITs.</h1>
        <p className="mt-3 max-w-2xl text-slate-300">Find other students travelling on similar routes, or share your own upcoming journey.</p>
        <button type="button" onClick={() => setShowForm((value) => !value)} className="mt-5 rounded-xl bg-indigo-600 px-5 py-3 font-semibold hover:bg-indigo-500">
          {showForm ? 'Close form' : '+ Share travel plan'}
        </button>
      </section>

      {showForm && (
        <form onSubmit={submitTravel} className="space-y-4 rounded-2xl border border-slate-800 bg-slate-950 p-5 md:p-6">
          <h2 className="text-xl font-semibold">Create a travel plan</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1 text-sm text-slate-300">Travel mode
              <select name="travelMode" value={form.travelMode} onChange={updateForm} className="w-full rounded-xl border border-slate-700 bg-slate-900 p-3 text-white">
                <option>Train</option><option>Flight</option><option>Bus</option>
              </select>
            </label>
            <label className="space-y-1 text-sm text-slate-300">Travel date
              <input required type="date" name="travelDate" value={form.travelDate} onChange={updateForm} min={new Date().toISOString().slice(0, 10)} className="w-full rounded-xl border border-slate-700 bg-slate-900 p-3 text-white" />
            </label>
            <label className="space-y-1 text-sm text-slate-300">From
              <input required maxLength="120" name="from" value={form.from} onChange={updateForm} placeholder="Origin city or station" className="w-full rounded-xl border border-slate-700 bg-slate-900 p-3 text-white" />
            </label>
            <label className="space-y-1 text-sm text-slate-300">To
              <input required maxLength="120" name="to" value={form.to} onChange={updateForm} placeholder="Destination city or station" className="w-full rounded-xl border border-slate-700 bg-slate-900 p-3 text-white" />
            </label>
            <label className="space-y-1 text-sm text-slate-300">Contact preference
              <select name="contactPreference" value={form.contactPreference} onChange={updateForm} className="w-full rounded-xl border border-slate-700 bg-slate-900 p-3 text-white">
                <option>Email</option><option>Phone</option><option>WhatsApp</option>
              </select>
            </label>
            <label className="space-y-1 text-sm text-slate-300">Seat details (private to you)
              <input maxLength="80" name="seatDetails" value={form.seatDetails} onChange={updateForm} placeholder="Optional; never shown in public listings" className="w-full rounded-xl border border-slate-700 bg-slate-900 p-3 text-white" />
            </label>
          </div>
          <label className="block space-y-1 text-sm text-slate-300">Notes
            <textarea rows="3" maxLength="1000" name="notes" value={form.notes} onChange={updateForm} placeholder="Share any useful travel details..." className="w-full rounded-xl border border-slate-700 bg-slate-900 p-3 text-white" />
          </label>
          <button disabled={saving} className="rounded-xl bg-indigo-600 px-5 py-3 font-semibold disabled:opacity-50">{saving ? 'Submitting…' : 'Submit for approval'}</button>
        </form>
      )}

      <section className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div><h2 className="text-xl font-bold">Student travel plans</h2><p className="text-sm text-slate-400">Only admin-approved plans appear here.</p></div>
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search route, mode or IIT..." className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-white md:w-72" />
        </div>
        {loading ? <p className="py-10 text-center text-slate-400">Loading travel plans…</p> : filteredPosts.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredPosts.map((post) => (
              <article key={post._id} className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
                <div className="flex items-center justify-between gap-2"><span className="rounded-full bg-indigo-500/15 px-3 py-1 text-xs text-indigo-300">{post.travelMode}</span><span className="text-xs text-slate-400">{new Date(post.travelDate).toLocaleDateString()}</span></div>
                <h3 className="mt-4 text-lg font-semibold">{post.from} <span className="text-indigo-300">→</span> {post.to}</h3>
                <p className="mt-2 whitespace-pre-wrap text-sm text-slate-300">{post.notes || 'No additional notes.'}</p>
                <div className="mt-4 border-t border-slate-800 pt-3 text-xs text-slate-400">
                  <p>{post.authorId?.profile?.name || 'Student'} · {post.authorId?.profile?.iit || 'IIT student'}</p>
                </div>
              </article>
            ))}
          </div>
        ) : <div className="rounded-2xl border border-slate-800 bg-slate-950 p-10 text-center text-slate-400">No approved travel plans found. Be the first to share one.</div>}
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold">My submissions</h2>
        {mine.length ? <div className="overflow-hidden rounded-2xl border border-slate-800">
          {mine.map((post) => <div key={post._id} className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 bg-slate-950 p-4 last:border-0">
            <div><p className="font-medium">{post.from} → {post.to}</p><p className="text-xs text-slate-400">{post.travelMode} · {new Date(post.travelDate).toLocaleDateString()}</p></div>
            <span className={post.status === 'Approved' ? 'rounded-full bg-emerald-500/15 px-3 py-1 text-xs text-emerald-300' : post.status === 'Rejected' ? 'rounded-full bg-rose-500/15 px-3 py-1 text-xs text-rose-300' : 'rounded-full bg-amber-500/15 px-3 py-1 text-xs text-amber-300'}>{post.status}</span>
          </div>)}
        </div> : <p className="text-sm text-slate-400">You haven't submitted any travel plans yet.</p>}
      </section>
    </div>
  )
}
