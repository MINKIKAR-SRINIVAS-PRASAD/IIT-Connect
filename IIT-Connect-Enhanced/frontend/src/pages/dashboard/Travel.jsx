import React, { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { api } from '../../utils/api'

const categories = ['All', 'Trekking', 'Weekend Trips', 'Pilgrimage', 'Adventure', 'Sightseeing']
const emptyForm = {
  destination: '',
  location: '',
  category: 'Weekend Trips',
  description: '',
  date: '',
  budget: '',
  members: 1
}

function formatDate(value) {
  if (!value) return 'Date not specified'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'Date not specified' : date.toLocaleDateString()
}

export default function Travel() {
  const [trips, setTrips] = useState([])
  const [myTrips, setMyTrips] = useState([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  async function loadTrips() {
    setLoading(true)
    try {
      const [approvedResponse, mineResponse] = await Promise.all([
        api.get('/travel'),
        api.get('/travel/mine')
      ])
      setTrips(approvedResponse.data.posts || [])
      setMyTrips(mineResponse.data.posts || [])
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to load travel plans')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadTrips() }, [])

  const filteredTrips = useMemo(() => {
    const query = search.trim().toLowerCase()
    return trips.filter((trip) => {
      const matchesCategory = category === 'All' || trip.category === category
      const matchesSearch = !query || [trip.destination, trip.location, trip.description, trip.authorId?.profile?.name, trip.authorId?.profile?.iit]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
      return matchesCategory && matchesSearch
    })
  }, [trips, category, search])

  const destinationsCount = new Set(trips.map((trip) => trip.destination?.trim().toLowerCase()).filter(Boolean)).size

  function updateForm(event) {
    const { name, value } = event.target
    setForm((previous) => ({ ...previous, [name]: value }))
  }

  async function createTrip(event) {
    event.preventDefault()
    if (!form.destination.trim() || !form.location.trim() || !form.description.trim()) {
      toast.error('Please fill all required fields')
      return
    }

    setSaving(true)
    try {
      await api.post('/travel', {
        ...form,
        members: Number(form.members)
      })
      toast.success('Travel plan submitted for admin approval')
      setForm(emptyForm)
      setShowForm(false)
      await loadTrips()
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Could not submit travel plan')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 text-white">
      <section className="rounded-3xl border border-indigo-900/50 bg-gradient-to-r from-indigo-950 via-slate-950 to-purple-950 p-8">
        <div className="mb-3 text-sm font-semibold text-indigo-300">✈ IIT Connect Travel Community</div>
        <h1 className="text-3xl font-bold md:text-4xl">Explore. Travel. Connect.</h1>
        <p className="mt-3 max-w-2xl text-slate-300">
          Discover new destinations, find travel partners, share your travel plans and explore India with students from different IITs.
        </p>
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="mt-6 rounded-xl bg-indigo-600 px-6 py-3 font-semibold transition hover:bg-indigo-500"
        >
          + Share Travel Plan
        </button>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
          <p className="text-sm text-slate-400">Approved Travel Plans</p>
          <h2 className="mt-2 text-3xl font-bold">{trips.length}</h2>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
          <p className="text-sm text-slate-400">Categories</p>
          <h2 className="mt-2 text-3xl font-bold">{categories.length - 1}</h2>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
          <p className="text-sm text-slate-400">Destinations</p>
          <h2 className="mt-2 text-3xl font-bold">{destinationsCount}</h2>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold">Discover Travel Plans</h2>
          <p className="mt-1 text-sm text-slate-400">Find students and explore destinations together.</p>
        </div>
        <input
          type="text"
          placeholder="Search destinations or locations..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 outline-none focus:border-indigo-500"
        />
        <div className="flex flex-wrap gap-2">
          {categories.map((item) => (
            <button
              type="button"
              key={item}
              onClick={() => setCategory(item)}
              className={`rounded-full px-4 py-2 text-sm transition ${
                category === item ? 'bg-indigo-600 text-white' : 'border border-slate-800 text-slate-300 hover:bg-slate-900'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </section>

      {showForm && (
        <section className="rounded-2xl border border-indigo-800 bg-slate-950 p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-bold">Create Travel Plan</h2>
            <button type="button" onClick={() => setShowForm(false)} className="text-slate-400 hover:text-white" aria-label="Close form">✕</button>
          </div>
          <form onSubmit={createTrip} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <label className="block text-sm text-slate-300">Destination *
                <input required maxLength={120} name="destination" value={form.destination} onChange={updateForm} placeholder="e.g. Manali" className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-900 p-3 text-white outline-none" />
              </label>
              <label className="block text-sm text-slate-300">Location *
                <input required maxLength={120} name="location" value={form.location} onChange={updateForm} placeholder="State / Country" className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-900 p-3 text-white outline-none" />
              </label>
              <label className="block text-sm text-slate-300">Category
                <select name="category" value={form.category} onChange={updateForm} className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-900 p-3 text-white">
                  {categories.slice(1).map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </label>
              <label className="block text-sm text-slate-300">Travel Date
                <input type="date" name="date" value={form.date} onChange={updateForm} min={new Date().toISOString().slice(0, 10)} className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-900 p-3 text-white" />
              </label>
              <label className="block text-sm text-slate-300">Budget per person
                <input maxLength={40} name="budget" value={form.budget} onChange={updateForm} placeholder="e.g. ₹5000" className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-900 p-3 text-white outline-none" />
              </label>
              <label className="block text-sm text-slate-300">Maximum members
                <input type="number" name="members" min="1" max="50" value={form.members} onChange={updateForm} className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-900 p-3 text-white" />
              </label>
            </div>
            <label className="block text-sm text-slate-300">Description *
              <textarea required maxLength={1000} name="description" value={form.description} onChange={updateForm} rows="4" placeholder="Describe your travel plan..." className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-900 p-3 text-white outline-none" />
            </label>
            <p className="text-xs text-slate-400">Your plan will appear publicly only after admin approval.</p>
            <button type="submit" disabled={saving} className="rounded-xl bg-indigo-600 px-6 py-3 font-semibold hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50">
              {saving ? 'Submitting...' : 'Publish Travel Plan'}
            </button>
          </form>
        </section>
      )}

      <section>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-bold">Available Travel Plans</h2>
          <span className="text-sm text-slate-400">{filteredTrips.length} results</span>
        </div>
        {loading ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-12 text-center text-slate-400">Loading travel plans...</div>
        ) : filteredTrips.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-12 text-center">
            <div className="mb-4 text-5xl">✈️</div>
            <h3 className="text-xl font-semibold">No travel plans found</h3>
            <p className="mt-2 text-slate-400">Try another destination or create a new travel plan.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredTrips.map((trip) => (
              <article key={trip._id} className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 transition hover:border-indigo-600">
                <div className="flex h-36 items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900">
                  <span className="text-6xl">🏔️</span>
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-full bg-indigo-500/20 px-3 py-1 text-xs text-indigo-300">{trip.category}</span>
                    <span className="text-xs text-slate-400">{formatDate(trip.travelDate)}</span>
                  </div>
                  <h3 className="mt-4 text-xl font-bold">{trip.destination}</h3>
                  <p className="mt-1 text-sm text-slate-400">📍 {trip.location}</p>
                  <p className="mt-4 min-h-12 whitespace-pre-wrap text-sm text-slate-300">{trip.description}</p>
                  <div className="mt-4 space-y-2 border-t border-slate-800 pt-4">
                    <div className="flex justify-between gap-3 text-sm"><span className="text-slate-400">Budget / person</span><span className="font-semibold">{trip.budget || 'Not specified'}</span></div>
                    <div className="flex justify-between gap-3 text-sm"><span className="text-slate-400">Maximum members</span><span>{trip.members}</span></div>
                    <div className="flex justify-between gap-3 text-sm"><span className="text-slate-400">Organized by</span><span className="text-right text-indigo-300">{trip.authorId?.profile?.name || trip.name || 'IIT Student'}</span></div>
                    <p className="text-xs text-slate-500">{trip.authorId?.profile?.iit || trip.iit || ''}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {myTrips.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xl font-bold">My Travel Plan Submissions</h2>
          <div className="overflow-hidden rounded-2xl border border-slate-800">
            {myTrips.map((trip) => (
              <div key={trip._id} className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 bg-slate-950 p-4 last:border-0">
                <div>
                  <p className="font-medium">{trip.destination} · {trip.location}</p>
                  <p className="text-xs text-slate-400">{trip.category} · {formatDate(trip.travelDate)}</p>
                </div>
                <span className={trip.status === 'Approved' ? 'rounded-full bg-emerald-500/15 px-3 py-1 text-xs text-emerald-300' : trip.status === 'Rejected' ? 'rounded-full bg-rose-500/15 px-3 py-1 text-xs text-rose-300' : 'rounded-full bg-amber-500/15 px-3 py-1 text-xs text-amber-300'}>{trip.status}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
