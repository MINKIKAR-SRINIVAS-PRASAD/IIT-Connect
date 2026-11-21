import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { api } from '../../utils/api'
import { Plane, TrainFront, BusFront, ShieldCheck, Send, Trash2, RefreshCw } from 'lucide-react'

const inputClass = 'mt-2 w-full rounded-xl border border-slate-700/80 bg-[#111a30] px-3.5 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/10'

const fields = {
  Train: [
    ['trainName', 'Train name', 'text'], ['trainNumber', 'Train number', 'text'],
    ['pnr', 'PNR', 'text'], ['bookingStatus', 'Booking status', 'select'],
    ['coach', 'Coach number', 'text'], ['seat', 'Seat / berth number', 'text'],
    ['berthType', 'Berth type', 'text'], ['boardingStation', 'Boarding station', 'text'],
    ['arrivalStation', 'Destination station', 'text'], ['departureDate', 'Departure date', 'date'],
    ['departureTime', 'Departure time', 'time'], ['arrivalDate', 'Arrival date', 'date'],
    ['arrivalTime', 'Arrival time', 'time']
  ],
  Bus: [
    ['operator', 'Bus operator', 'text'], ['serviceNumber', 'Service number', 'text'],
    ['busType', 'Bus type', 'text'], ['ticketReference', 'Ticket reference', 'text'],
    ['seatNumber', 'Seat number', 'text'], ['boardingPoint', 'Boarding point', 'text'],
    ['dropPoint', 'Drop point', 'text'], ['departureDate', 'Departure date', 'date'],
    ['departureTime', 'Departure time', 'time'], ['arrivalDate', 'Arrival date', 'date'],
    ['arrivalTime', 'Arrival time', 'time']
  ],
  Flight: [
    ['airline', 'Airline', 'text'], ['flightNumber', 'Flight number', 'text'],
    ['airlinePnr', 'Airline PNR', 'text'], ['bookingReference', 'Booking reference', 'text'],
    ['flightSeat', 'Seat number', 'text'], ['departureAirport', 'Departure airport', 'text'],
    ['arrivalAirport', 'Arrival airport', 'text'], ['departureDate', 'Departure date', 'date'],
    ['departureTime', 'Departure time', 'time'], ['arrivalDate', 'Arrival date', 'date'],
    ['arrivalTime', 'Arrival time', 'time']
  ]
}

const emptyBooking = {
  trainName: '', trainNumber: '', pnr: '', bookingStatus: 'Confirmed', coach: '', seat: '',
  berthType: '', boardingStation: '', arrivalStation: '', operator: '', serviceNumber: '',
  busType: '', ticketReference: '', seatNumber: '', boardingPoint: '', dropPoint: '',
  airline: '', flightNumber: '', airlinePnr: '', bookingReference: '', flightSeat: '',
  departureAirport: '', arrivalAirport: '', departureDate: '', departureTime: '',
  arrivalDate: '', arrivalTime: ''
}

function TransportIcon({ mode }) {
  const Icon = mode === 'Train' ? TrainFront : mode === 'Bus' ? BusFront : Plane
  return <Icon size={18} />
}

function Field({ field, value, onChange }) {
  const [name, label, type] = field
  return (
    <label className="block text-sm text-slate-300">
      {label}
      {type === 'select' ? (
        <select required name={name} value={value || 'Confirmed'} onChange={onChange} className={inputClass}>
          <option value="Confirmed">Confirmed</option>
          <option value="RAC">RAC</option>
          <option value="Waiting List">Waiting List</option>
          <option value="Booked">Booked</option>
        </select>
      ) : (
        <input required name={name} type={type} value={value || ''} onChange={onChange} className={inputClass} />
      )}
    </label>
  )
}

export default function TravelHome() {
  const [mode, setMode] = useState('Train')
  const [booking, setBooking] = useState(emptyBooking)
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function loadBookings() {
    setLoading(true)
    try {
      const response = await api.get('/transport-bookings')
      setBookings(Array.isArray(response.data?.bookings) ? response.data.bookings : [])
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not load your saved bookings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadBookings() }, [])

  function change(event) {
    setBooking(current => ({ ...current, [event.target.name]: event.target.value }))
    setError('')
  }

  async function submit(event) {
    event.preventDefault()
    const missing = fields[mode].filter(([key]) => !String(booking[key] ?? '').trim())
    if (missing.length) {
      setError('Please complete every required ' + mode + ' booking field.')
      return
    }
    if (booking.arrivalDate < booking.departureDate) {
      setError('Arrival date cannot be before departure date.')
      return
    }
    if (booking.arrivalDate === booking.departureDate && booking.arrivalTime <= booking.departureTime) {
      setError('Arrival time must be later than departure time.')
      return
    }

    setSaving(true)
    setError('')
    try {
      await api.post('/transport-bookings', { transportType: mode, booking })
      toast.success('Travel booking saved privately.')
      setBooking(emptyBooking)
      await loadBookings()
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not save booking. Please check the details and try again.')
    } finally {
      setSaving(false)
    }
  }

  async function removeBooking(id) {
    try {
      await api.delete('/transport-bookings/' + id)
      toast.success('Booking removed.')
      setBookings(current => current.filter(item => item._id !== id))
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not remove booking')
    }
  }

  return (
    <div className="sage-page-theme space-y-6 text-slate-100">
      <header className="page-hero rounded-[26px] border p-6 md:p-8">
        <p className="text-xs font-bold uppercase tracking-[.18em] text-cyan-300">Private transport manager</p>
        <h1 className="mt-2 text-3xl font-black">Travel Home</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-300">Save and manage your train, bus and flight booking details in one private place. This page works independently from Trip.</p>
      </header>

      <form onSubmit={submit} className="space-y-6 rounded-3xl border border-[#a8c49a]/20 bg-gradient-to-br from-[#1b2820] to-[#17231c] p-5 shadow-2xl md:p-7">
        <div>
          <h2 className="text-lg font-bold text-indigo-100">Add a transport booking</h2>
          <p className="mt-1 text-sm text-slate-400">Choose a transport type and complete every field. All fields are mandatory.</p>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {['Train', 'Bus', 'Flight'].map(item => (
            <button type="button" key={item} onClick={() => { setMode(item); setError('') }} className={'flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-semibold ' + (mode === item ? 'border-cyan-300/50 bg-cyan-300/15 text-cyan-100' : 'border-white/10 bg-[#101a30] text-slate-400 hover:border-white/25')}>
              <TransportIcon mode={item} />{item}
            </button>
          ))}
        </div>
        <div className="grid gap-4 rounded-2xl border border-white/10 bg-[#0d172b]/70 p-4 md:grid-cols-2">
          {fields[mode].map(field => <Field key={field[0]} field={field} value={booking[field[0]]} onChange={change} />)}
        </div>
        <div className="flex gap-3 rounded-2xl border border-amber-300/15 bg-amber-300/[.06] p-4">
          <ShieldCheck size={19} className="mt-0.5 shrink-0 text-amber-200" />
          <p className="text-xs leading-5 text-slate-300"><b className="text-amber-100">Your booking privacy matters.</b> PNRs, ticket references, seat and coach details are saved privately to your account and are not part of the public Trip community.</p>
        </div>
        {error && <p role="alert" className="rounded-xl border border-rose-300/20 bg-rose-300/10 p-3 text-sm text-rose-200">{error}</p>}
        <button disabled={saving} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#8fa982] px-5 py-4 font-bold text-[#111810] shadow-lg transition hover:brightness-110 disabled:opacity-50">
          {saving ? 'Saving…' : 'Save booking privately'}<Send size={17} />
        </button>
      </form>

      <section className="space-y-4 rounded-3xl border border-white/10 bg-[#14213a] p-5 md:p-7">
        <div className="flex items-center justify-between gap-3">
          <div><h2 className="text-lg font-bold">My saved bookings</h2><p className="mt-1 text-sm text-slate-400">Only your saved bookings appear here.</p></div>
          <button type="button" onClick={loadBookings} className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-300 hover:bg-white/5"><RefreshCw size={15} /> Refresh</button>
        </div>
        {loading ? <p className="text-sm text-slate-400">Loading bookings…</p> : bookings.length === 0 ? (
          <p className="rounded-xl border border-dashed border-white/15 p-6 text-center text-sm text-slate-400">No saved bookings yet. Add your first booking above.</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {bookings.map(item => (
              <article key={item._id} className="rounded-2xl border border-white/10 bg-[#0d172b]/70 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 font-semibold text-cyan-100"><TransportIcon mode={item.transportType} />{item.transportType}</div>
                  <button type="button" onClick={() => removeBooking(item._id)} aria-label="Remove booking" className="rounded-lg p-2 text-rose-300 hover:bg-rose-300/10"><Trash2 size={16} /></button>
                </div>
                <p className="mt-3 text-sm font-semibold">{item.booking?.trainName || item.booking?.operator || item.booking?.airline || item.booking?.flightNumber || 'Transport booking'}</p>
                <p className="mt-1 text-xs text-slate-400">{item.booking?.departureDate} · {item.booking?.departureTime} → {item.booking?.arrivalDate} · {item.booking?.arrivalTime}</p>
                <p className="mt-2 text-xs text-slate-400">{item.booking?.boardingStation || item.booking?.boardingPoint || item.booking?.departureAirport || 'Origin'} → {item.booking?.arrivalStation || item.booking?.dropPoint || item.booking?.arrivalAirport || 'Destination'}</p>
                {item.booking?.bookingStatus && <p className="mt-2 text-xs text-emerald-300">Status: {item.booking.bookingStatus}</p>}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
