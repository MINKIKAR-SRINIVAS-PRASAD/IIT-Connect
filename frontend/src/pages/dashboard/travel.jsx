
import React, { useMemo, useState } from 'react'
import toast from 'react-hot-toast'

const categories = [
  'All',
  'Trekking',
  'Weekend Trips',
  'Pilgrimage',
  'Adventure',
  'Sightseeing'
]

const initialTrips = [
  {
    id: 1,
    destination: 'Puri',
    location: 'Odisha',
    category: 'Weekend Trips',
    description: 'Explore the beautiful beaches and Jagannath Temple.',
    date: 'Weekend',
    budget: '₹2,000',
    members: 4,
    organizer: 'IIT Student'
  },
  {
    id: 2,
    destination: 'Darjeeling',
    location: 'West Bengal',
    category: 'Sightseeing',
    description: 'Enjoy mountain views, tea gardens and beautiful scenery.',
    date: 'Upcoming',
    budget: '₹5,000',
    members: 6,
    organizer: 'IIT Student'
  },
  {
    id: 3,
    destination: 'Araku Valley',
    location: 'Andhra Pradesh',
    category: 'Adventure',
    description: 'Discover waterfalls, coffee plantations and valleys.',
    date: 'Weekend',
    budget: '₹3,000',
    members: 5,
    organizer: 'IIT Student'
  }
]

export default function Travel() {
  const [trips, setTrips] = useState(initialTrips)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [showForm, setShowForm] = useState(false)

  const [form, setForm] = useState({
    destination: '',
    location: '',
    category: 'Weekend Trips',
    description: '',
    date: '',
    budget: '',
    members: 1
  })

  const filteredTrips = useMemo(() => {
    return trips.filter((trip) => {
      const matchesCategory =
        category === 'All' || trip.category === category

      const searchText = search.toLowerCase()

      const matchesSearch =
        trip.destination.toLowerCase().includes(searchText) ||
        trip.location.toLowerCase().includes(searchText)

      return matchesCategory && matchesSearch
    })
  }, [trips, category, search])

  function updateForm(e) {
    const { name, value } = e.target

    setForm((previous) => ({
      ...previous,
      [name]: value
    }))
  }

  function createTrip(e) {
    e.preventDefault()

    if (
      !form.destination.trim() ||
      !form.location.trim() ||
      !form.description.trim()
    ) {
      toast.error('Please fill all required fields')
      return
    }

    const newTrip = {
      ...form,
      id: Date.now(),
      members: Number(form.members),
      organizer: 'You'
    }

    setTrips((previous) => [newTrip, ...previous])

    setForm({
      destination: '',
      location: '',
      category: 'Weekend Trips',
      description: '',
      date: '',
      budget: '',
      members: 1
    })

    setShowForm(false)
    toast.success('Travel plan added!')
  }

  return (
    <div className="space-y-6 text-white">

      {/* Header */}
      <section className="rounded-3xl border border-indigo-900/50 bg-gradient-to-r from-indigo-950 via-slate-950 to-purple-950 p-8">

        <div className="text-indigo-300 text-sm font-semibold mb-3">
          ✈ IIT Connect Travel Community
        </div>

        <h1 className="text-3xl md:text-4xl font-bold">
          Explore. Travel. Connect.
        </h1>

        <p className="text-slate-300 mt-3 max-w-2xl">
          Discover new destinations, find travel partners,
          share your travel plans and explore India with
          students from different IITs.
        </p>

        <button
          onClick={() => setShowForm(true)}
          className="mt-6 rounded-xl bg-indigo-600 px-6 py-3 font-semibold hover:bg-indigo-500 transition"
        >
          + Share Travel Plan
        </button>
      </section>

      {/* Statistics */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
          <p className="text-slate-400 text-sm">Travel Plans</p>
          <h2 className="text-3xl font-bold mt-2">
            {trips.length}
          </h2>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
          <p className="text-slate-400 text-sm">Categories</p>
          <h2 className="text-3xl font-bold mt-2">
            {categories.length - 1}
          </h2>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
          <p className="text-slate-400 text-sm">Destinations</p>
          <h2 className="text-3xl font-bold mt-2">
            {new Set(trips.map((trip) => trip.destination)).size}
          </h2>
        </div>

      </section>

      {/* Search */}
      <section className="space-y-4">

        <div>
          <h2 className="text-xl font-bold">
            Discover Travel Plans
          </h2>

          <p className="text-sm text-slate-400 mt-1">
            Find students and explore destinations together.
          </p>
        </div>

        <input
          type="text"
          placeholder="Search destinations or locations..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 outline-none focus:border-indigo-500"
        />

        {/* Categories */}
        <div className="flex flex-wrap gap-2">
          {categories.map((item) => (
            <button
              key={item}
              onClick={() => setCategory(item)}
              className={`rounded-full px-4 py-2 text-sm transition ${
                category === item
                  ? 'bg-indigo-600 text-white'
                  : 'border border-slate-800 text-slate-300 hover:bg-slate-900'
              }`}
            >
              {item}
            </button>
          ))}
        </div>

      </section>

      {/* Create Travel Form */}
      {showForm && (
        <section className="rounded-2xl border border-indigo-800 bg-slate-950 p-6">

          <div className="flex justify-between items-center mb-5">
            <h2 className="text-xl font-bold">
              Create Travel Plan
            </h2>

            <button
              onClick={() => setShowForm(false)}
              className="text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          <form onSubmit={createTrip} className="space-y-4">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div>
                <label className="text-sm text-slate-300">
                  Destination *
                </label>

                <input
                  name="destination"
                  value={form.destination}
                  onChange={updateForm}
                  placeholder="e.g. Manali"
                  className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-900 p-3 outline-none"
                />
              </div>

              <div>
                <label className="text-sm text-slate-300">
                  Location *
                </label>

                <input
                  name="location"
                  value={form.location}
                  onChange={updateForm}
                  placeholder="State / Country"
                  className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-900 p-3 outline-none"
                />
              </div>

              <div>
                <label className="text-sm text-slate-300">
                  Category
                </label>

                <select
                  name="category"
                  value={form.category}
                  onChange={updateForm}
                  className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-900 p-3"
                >
                  {categories.slice(1).map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm text-slate-300">
                  Travel Date
                </label>

                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={updateForm}
                  className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-900 p-3"
                />
              </div>

              <div>
                <label className="text-sm text-slate-300">
                  Budget per person
                </label>

                <input
                  name="budget"
                  value={form.budget}
                  onChange={updateForm}
                  placeholder="e.g. ₹5000"
                  className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-900 p-3"
                />
              </div>

              <div>
                <label className="text-sm text-slate-300">
                  Maximum members
                </label>

                <input
                  type="number"
                  name="members"
                  min="1"
                  max="50"
                  value={form.members}
                  onChange={updateForm}
                  className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-900 p-3"
                />
              </div>

            </div>

            <div>
              <label className="text-sm text-slate-300">
                Description *
              </label>

              <textarea
                name="description"
                value={form.description}
                onChange={updateForm}
                rows="4"
                placeholder="Describe your travel plan..."
                className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-900 p-3 outline-none"
              />
            </div>

            <button
              type="submit"
              className="rounded-xl bg-indigo-600 px-6 py-3 font-semibold hover:bg-indigo-500"
            >
              Publish Travel Plan
            </button>

          </form>
        </section>
      )}

      {/* Travel Cards */}
      <section>

        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold">
            Available Travel Plans
          </h2>

          <span className="text-sm text-slate-400">
            {filteredTrips.length} results
          </span>
        </div>

        {filteredTrips.length === 0 ? (

          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-12 text-center">
            <div className="text-5xl mb-4">✈️</div>

            <h3 className="text-xl font-semibold">
              No travel plans found
            </h3>

            <p className="mt-2 text-slate-400">
              Try another destination or create a new travel plan.
            </p>
          </div>

        ) : (

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

            {filteredTrips.map((trip) => (

              <article
                key={trip.id}
                className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden hover:border-indigo-600 transition"
              >

                <div className="h-36 bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 flex items-center justify-center">
                  <span className="text-6xl">🏔️</span>
                </div>

                <div className="p-5">

                  <div className="flex justify-between items-center gap-2">

                    <span className="text-xs rounded-full bg-indigo-500/20 text-indigo-300 px-3 py-1">
                      {trip.category}
                    </span>

                    <span className="text-xs text-slate-400">
                      {trip.date || 'Date not specified'}
                    </span>

                  </div>

                  <h3 className="text-xl font-bold mt-4">
                    {trip.destination}
                  </h3>

                  <p className="text-sm text-slate-400 mt-1">
                    📍 {trip.location}
                  </p>

                  <p className="text-sm text-slate-300 mt-4 min-h-12">
                    {trip.description}
                  </p>

                  <div className="border-t border-slate-800 mt-4 pt-4 space-y-2">

                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">
                        Budget / person
                      </span>

                      <span className="font-semibold">
                        {trip.budget || 'Not specified'}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">
                        Maximum members
                      </span>

                      <span>
                        {trip.members}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">
                        Organized by
                      </span>

                      <span className="text-indigo-300">
                        {trip.organizer}
                      </span>
                    </div>

                  </div>

                </div>

              </article>

            ))}

          </div>

        )}

      </section>

    </div>
  )
}
