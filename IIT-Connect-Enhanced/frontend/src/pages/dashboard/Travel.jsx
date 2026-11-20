import React, { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { api } from '../../utils/api'
import { Plane, TrainFront, BusFront, MapPin, CalendarDays, Users, ShieldCheck, Search, Plus, X, Ticket, Clock3 } from 'lucide-react'

const categories = ['All', 'Trekking', 'Weekend Trips', 'Pilgrimage', 'Adventure', 'Sightseeing']
const initial = {
  destination: '', location: '', category: 'Weekend Trips', description: '', date: '',
  budget: '', members: 1, travelMode: 'Train',
  booking: {
    trainName: '', trainNumber: '', pnr: '', bookingStatus: 'Confirmed', coach: '', seat: '', berthType: '',
    boardingStation: '', arrivalStation: '', departureDate: '', departureTime: '', arrivalDate: '', arrivalTime: '',
    operator: '', serviceNumber: '', busType: '', ticketReference: '', seatNumber: '', boardingPoint: '', dropPoint: '',
    airline: '', flightNumber: '', airlinePnr: '', bookingReference: '', flightSeat: '', departureAirport: '', arrivalAirport: ''
  }
}
const fieldSets = {
  Train: [
    ['trainName','Train name','text'],['trainNumber','Train number','text'],['pnr','PNR','text'],['bookingStatus','Booking status','select'],
    ['coach','Coach number','text'],['seat','Seat / berth number','text'],['berthType','Berth type','text'],
    ['boardingStation','Boarding station','text'],['arrivalStation','Destination station','text'],
    ['departureDate','Departure date','date'],['departureTime','Departure time','time'],['arrivalDate','Arrival date','date'],['arrivalTime','Arrival time','time']
  ],
  Bus: [
    ['operator','Bus operator','text'],['serviceNumber','Service number','text'],['busType','Bus type','text'],['ticketReference','Ticket reference','text'],
    ['seatNumber','Seat number','text'],['boardingPoint','Boarding point','text'],['dropPoint','Drop point','text'],
    ['departureDate','Journey date','date'],['departureTime','Departure time','time'],['arrivalDate','Arrival date','date'],['arrivalTime','Arrival time','time']
  ],
  Flight: [
    ['airline','Airline','text'],['flightNumber','Flight number','text'],['airlinePnr','Airline PNR','text'],['bookingReference','Booking reference','text'],
    ['flightSeat','Seat number','text'],['departureAirport','Departure airport','text'],['arrivalAirport','Arrival airport','text'],
    ['departureDate','Departure date','date'],['departureTime','Departure time','time'],['arrivalDate','Arrival date','date'],['arrivalTime','Arrival time','time']
  ]
}
const inputClass = 'mt-2 w-full rounded-xl border border-slate-700/80 bg-[#111a30] px-3.5 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/10'
function Field({name,label,type='text',value,onChange}) {
  if (type === 'select') return <label className="block text-sm text-slate-300">{label}<select name={name} className={inputClass} value={value} onChange={onChange}><option>Confirmed</option><option>RAC</option><option>Waiting List</option><option>Booked</option></select></label>
  return <label className="block text-sm text-slate-300">{label}<input required className={inputClass} type={type} name={name} value={value || ''} onChange={onChange}/></label>
}
function dateLabel(value) { return value ? new Date(value).toLocaleDateString() : 'Date not set' }
function ModeIcon({mode}) { const Icon = mode === 'Train' ? TrainFront : mode === 'Bus' ? BusFront : Plane; return <Icon size={18}/> }

export default function Travel() {
  const [trips,setTrips] = useState([]), [mine,setMine] = useState([])
  const [search,setSearch] = useState(''), [category,setCategory] = useState('All')
  const [showForm,setShowForm] = useState(false), [form,setForm] = useState(initial)
  const [loading,setLoading] = useState(true), [saving,setSaving] = useState(false)
  const [incoming,setIncoming] = useState([]), [outgoing,setOutgoing] = useState([]), [privateBooking,setPrivateBooking] = useState(null)
  async function load() {
    setLoading(true)
    try {
      const [a,b] = await Promise.all([api.get('/travel'),api.get('/travel/mine')])
      setTrips(a.data.posts || []); setMine(b.data.posts || [])
      const [c,d] = await Promise.all([api.get('/travel/access-requests/incoming'),api.get('/travel/access-requests/mine')])
      setIncoming(c.data.requests || []); setOutgoing(d.data.requests || [])
    } catch(e) { toast.error(e?.response?.data?.message || 'Unable to load trips') }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return trips.filter(t => (category === 'All' || t.category === category) &&
      (!q || [t.destination,t.location,t.description,t.authorId?.profile?.name,t.authorId?.profile?.iit].filter(Boolean).some(v => String(v).toLowerCase().includes(q))))
  },[trips,category,search])
  function change(e) { const {name,value} = e.target; setForm(p => ({...p,[name]:value})) }
  function changeBooking(e) { const {name,value} = e.target; setForm(p => ({...p,booking:{...p.booking,[name]:value}})) }
  async function submit(e) {
    e.preventDefault()
    if (!form.destination.trim() || !form.location.trim() || !form.date || !form.budget.trim() || !form.description.trim()) { toast.error('Complete all trip information'); return }
    const required = fieldSets[form.travelMode]
    if (required.some(([key]) => !String(form.booking[key] || '').trim())) { toast.error('Complete every required booking detail for the selected transport'); return }
    setSaving(true)
    try {
      await api.post('/travel',{...form,members:Number(form.members)})
      toast.success('Trip submitted. It will appear after admin approval.')
      setForm(initial); setShowForm(false); await load()
    } catch(e) { toast.error(e?.response?.data?.message || 'Could not submit trip') }
    finally { setSaving(false) }
  }
  async function askForAccess(id) {
    try { await api.post('/travel/'+id+'/access-requests'); toast.success('Request sent to trip owner'); await load() }
    catch(e) { toast.error(e?.response?.data?.message || 'Could not send request') }
  }
  async function respondToAccess(id,decision) {
    try { await api.put('/travel/access-requests/'+id+'/respond',{decision}); toast.success(decision==='accept'?'Request accepted':'Request declined'); await load() }
    catch(e) { toast.error(e?.response?.data?.message || 'Could not update request') }
  }
  async function revealBooking(id) {
    try { const {data}=await api.get('/travel/'+id+'/private-details'); setPrivateBooking(data) }
    catch(e) { toast.error(e?.response?.data?.message || 'Private details are not available') }
  }
  async function remove(id) {
    if (!window.confirm('Delete this trip submission?')) return
    try { await api.delete('/travel/'+id); toast.success('Trip deleted'); await load() }
    catch(e) { toast.error(e?.response?.data?.message || 'Could not delete trip') }
  }
  const outgoingByTrip = new Map(outgoing.filter(r => r.tripId?._id).map(r => [r.tripId._id, r]))
  const destinations = new Set(trips.map(t => t.destination?.toLowerCase()).filter(Boolean)).size
  return <div className="space-y-7 text-slate-100">
    <section className="relative overflow-hidden rounded-[28px] border border-indigo-300/15 bg-[radial-gradient(ellipse_at_82%_8%,rgba(34,211,238,.22),transparent_34%),radial-gradient(ellipse_at_5%_100%,rgba(139,92,246,.25),transparent_38%),linear-gradient(120deg,#151b3b,#102b43_58%,#102f39)] p-6 shadow-[0_24px_80px_rgba(4,10,30,.35)] md:p-9">
      <div className="absolute -right-12 -top-16 h-64 w-64 rounded-full border border-cyan-100/10"/><div className="absolute -right-2 -top-7 h-44 w-44 rounded-full border border-cyan-100/10"/>
      <div className="relative max-w-3xl">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-200/20 bg-cyan-200/10 px-3 py-1.5 text-xs font-semibold tracking-wide text-cyan-100"><MapPin size={14}/> IIT CONNECT · TRIP COMMUNITY</div>
        <h1 className="text-4xl font-black tracking-tight md:text-5xl">Your next journey<br/><span className="bg-gradient-to-r from-cyan-200 via-indigo-200 to-violet-300 bg-clip-text text-transparent">starts together.</span></h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300 md:text-base">Find fellow students on the same route, share verified booking information and make every journey a little less solo.</p>
        <button onClick={() => setShowForm(true)} className="mt-7 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-950/40 transition hover:-translate-y-0.5 hover:brightness-110"><Plus size={17}/> Create a trip</button>
      </div>
    </section>
    <div className="grid gap-3 sm:grid-cols-3">
      {[['Approved trips',trips.length,Ticket],['Destinations',destinations,MapPin],['Trip categories',categories.length-1,CalendarDays]].map(([label,value,Icon]) => <div key={label} className="rounded-2xl border border-indigo-200/10 bg-gradient-to-br from-[#1b2543] to-[#111b30] p-5 shadow-lg shadow-black/10"><div className="flex items-center justify-between text-sm text-slate-400"><span>{label}</span><Icon size={17} className="text-cyan-300"/></div><div className="mt-2 text-3xl font-bold text-white">{value}</div></div>)}
    </div>
    {showForm && <section className="overflow-hidden rounded-3xl border border-cyan-300/20 bg-gradient-to-br from-[#182443] to-[#10192c] shadow-2xl shadow-black/30">
      <div className="flex items-center justify-between border-b border-white/10 bg-white/[.035] px-5 py-4 md:px-7"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-cyan-300">New journey</p><h2 className="mt-1 text-xl font-bold">Create your trip</h2></div><button onClick={() => setShowForm(false)} className="rounded-xl border border-white/10 p-2 text-slate-400 hover:bg-white/10 hover:text-white"><X size={18}/></button></div>
      <form onSubmit={submit} className="space-y-7 p-5 md:p-7">
        <div><h3 className="mb-3 text-sm font-bold text-indigo-200">01 · Trip overview</h3><div className="grid gap-4 md:grid-cols-2">
          <Field label="Destination" name="destination" value={form.destination} onChange={change}/><Field label="City / State / Country" name="location" value={form.location} onChange={change}/>
          <label className="block text-sm text-slate-300">Category<select name="category" value={form.category} onChange={change} className={inputClass}>{categories.slice(1).map(x=><option key={x}>{x}</option>)}</select></label>
          <Field label="Trip start date" name="date" type="date" value={form.date} onChange={change}/>
          <Field label="Budget per person" name="budget" value={form.budget} onChange={change}/>
          <label className="block text-sm text-slate-300">Maximum members<input className={inputClass} name="members" type="number" min="1" max="50" required value={form.members} onChange={change}/></label>
          <label className="block text-sm text-slate-300 md:col-span-2">Trip description<textarea className={inputClass} rows="3" name="description" required maxLength="1000" value={form.description} onChange={change} placeholder="Share your plan, itinerary and what kind of travel partners you're looking for."/></label>
        </div></div>
        <div><h3 className="mb-3 text-sm font-bold text-indigo-200">02 · Booking details</h3><p className="mb-4 text-xs text-slate-400">Choose your transport. Every applicable booking field is required for admin verification.</p>
          <div className="mb-4 grid grid-cols-3 gap-2">{['Train','Bus','Flight'].map(mode=><button type="button" key={mode} onClick={()=>setForm(p=>({...p,travelMode:mode}))} className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-semibold transition ${form.travelMode===mode?'border-cyan-300/50 bg-cyan-300/15 text-cyan-100 shadow-inner':'border-white/10 bg-[#101a30] text-slate-400 hover:border-white/25'}`}><ModeIcon mode={mode}/>{mode}</button>)}</div>
          <div className="grid gap-4 rounded-2xl border border-white/10 bg-[#0d172b]/70 p-4 md:grid-cols-2">{fieldSets[form.travelMode].map(([key,label,type])=><Field key={key} name={key} label={label} type={type} value={form.booking[key]} onChange={changeBooking}/>)}</div>
        </div>
        <div className="flex gap-3 rounded-2xl border border-amber-300/15 bg-amber-300/[.06] p-4"><ShieldCheck className="mt-0.5 shrink-0 text-amber-200" size={19}/><div className="text-xs leading-5 text-slate-300"><b className="text-amber-100">Your booking privacy matters.</b> PNRs and booking references are private. Other students must not see these identifiers on public trip cards. Admin reviews the complete booking; seat and coach details are not displayed on public trip cards. A student must request access and you must explicitly accept before private booking details are shared.</div></div>
        <button disabled={saving} className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 px-5 py-3.5 font-bold text-white shadow-lg shadow-indigo-950/40 transition hover:brightness-110 disabled:opacity-50">{saving?'Submitting for review…':'Submit trip for admin approval'}</button>
      </form>
    </section>}
    <section className="space-y-4"><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-cyan-300">Find your people</p><h2 className="mt-1 text-2xl font-bold">Explore trips</h2></div><span className="text-sm text-slate-400">{filtered.length} journeys</span></div>
      <div className="relative"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={17}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search destinations, campuses or people…" className="w-full rounded-xl border border-white/10 bg-[#131e35] py-3 pl-11 pr-4 text-sm text-white outline-none focus:border-cyan-400"/></div>
      <div className="flex flex-wrap gap-2">{categories.map(c=><button key={c} onClick={()=>setCategory(c)} className={`rounded-full px-4 py-2 text-xs font-semibold transition ${category===c?'bg-cyan-400 text-[#071321]':'border border-white/10 bg-[#17223a] text-slate-400 hover:text-white'}`}>{c}</button>)}</div>
      {loading?<div className="rounded-2xl border border-white/10 bg-[#121d33] p-12 text-center text-slate-400">Loading trips…</div>:filtered.length===0?<div className="rounded-2xl border border-dashed border-white/15 bg-[#121d33]/70 p-12 text-center"><div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-cyan-300/10 text-cyan-200"><MapPin size={25}/></div><h3 className="font-bold text-white">No matching trips yet</h3><p className="mt-1 text-sm text-slate-400">Try another search or share the first journey.</p></div>:
      <div className="grid gap-4 lg:grid-cols-2">{filtered.map(t=><article key={t._id} className="group overflow-hidden rounded-2xl border border-indigo-200/10 bg-gradient-to-br from-[#1b2745] to-[#111a2e] shadow-lg shadow-black/10 transition hover:-translate-y-1 hover:border-cyan-300/30">
        <div className="flex items-center justify-between border-b border-white/[.07] bg-white/[.025] px-5 py-3"><span className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-200"><ModeIcon mode={t.travelMode}/>{t.travelMode||'Trip'} journey</span><span className="rounded-full bg-indigo-300/10 px-3 py-1 text-[11px] text-indigo-200">{t.category}</span></div>
        <div className="p-5"><div className="flex flex-wrap items-center justify-between gap-2"><span className="text-xs text-slate-400">{dateLabel(t.travelDate)}</span><span className="inline-flex items-center gap-1 text-xs text-slate-400"><Users size={13}/>{t.members} max members</span></div>
          <h3 className="mt-3 text-xl font-bold text-white">{t.from || t.location} <span className="text-cyan-300">→</span> {t.to || t.destination}</h3><p className="mt-1 text-sm text-slate-400">{t.destination}, {t.location}</p><p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-300">{t.description}</p>
          <div className="mt-4 grid grid-cols-2 gap-3 border-t border-white/[.08] pt-4"><div><p className="text-[10px] uppercase tracking-wider text-slate-500">Budget / person</p><p className="mt-1 text-sm font-semibold text-white">{t.budget||'Not specified'}</p></div><div><p className="text-[10px] uppercase tracking-wider text-slate-500">Shared by</p><p className="mt-1 text-sm font-semibold text-indigo-200">{t.authorId?.profile?.name||'IIT student'}</p><p className="text-[11px] text-slate-500">{t.authorId?.profile?.iit||''}</p></div></div>
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-300/10 bg-emerald-300/[.045] px-3 py-2 text-[11px] text-emerald-200"><ShieldCheck size={14}/> Booking identifiers are hidden from public view</div>{outgoingByTrip.get(t._id)?.status==='Accepted'?<button onClick={()=>revealBooking(t._id)} className="mt-4 w-full rounded-xl border border-emerald-300/25 bg-emerald-300/10 px-4 py-2.5 text-sm font-semibold text-emerald-100">View shared booking details</button>:<button onClick={()=>askForAccess(t._id)} disabled={outgoingByTrip.get(t._id)?.status==='Pending'} className="mt-4 w-full rounded-xl border border-cyan-300/25 bg-cyan-300/10 px-4 py-2.5 text-sm font-semibold text-cyan-100 disabled:opacity-50">{outgoingByTrip.get(t._id)?.status==='Pending'?'Request pending':outgoingByTrip.get(t._id)?.status==='Declined'?'Request access again':'Request private booking details'}</button>}
        </div></article>)}</div>}
    </section>
    {incoming.length>0&&<section className="space-y-3"><h2 className="text-lg font-bold">Requests for my trips</h2>{incoming.map(r=><div key={r._id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-cyan-200/15 bg-[#17243d] p-4"><div><p className="font-semibold">{r.requesterId?.profile?.name||'Student'} wants booking details</p><p className="text-xs text-slate-400">{r.tripId?.destination} · {r.requesterId?.profile?.iit}</p></div><div className="flex gap-2"><button onClick={()=>respondToAccess(r._id,'accept')} className="rounded-lg bg-emerald-500/20 px-3 py-2 text-xs font-semibold text-emerald-200">Accept</button><button onClick={()=>respondToAccess(r._id,'decline')} className="rounded-lg bg-rose-500/15 px-3 py-2 text-xs font-semibold text-rose-200">Decline</button></div></div>)}</section>}
    {outgoing.length>0&&<section className="space-y-3"><h2 className="text-lg font-bold">My booking-detail requests</h2>{outgoing.map(r=><div key={r._id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#151f36] p-4"><div><p className="font-semibold">{r.tripId?.destination||'Trip'}</p><p className="text-xs text-slate-400">Owner: {r.ownerId?.profile?.name||'Student'} · {r.status}</p></div>{r.status==='Accepted'&&<button onClick={()=>revealBooking(r.tripId?._id)} className="rounded-lg bg-cyan-400/15 px-3 py-2 text-xs font-semibold text-cyan-100">View private details</button>}</div>)}</section>}
    {privateBooking&&<div className="fixed inset-0 z-50 grid place-items-center bg-black/75 p-4" onClick={()=>setPrivateBooking(null)}><section onClick={e=>e.stopPropagation()} className="max-h-[85vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-cyan-200/20 bg-[#111b30] p-6"><div className="flex items-center justify-between"><h2 className="text-xl font-bold">Private booking details</h2><button onClick={()=>setPrivateBooking(null)} className="rounded-lg p-2 text-slate-300 hover:bg-white/10"><X size={18}/></button></div><p className="mt-1 text-xs text-emerald-300">Shared after mutual consent or shown to the trip owner</p><div className="mt-5 grid gap-3 sm:grid-cols-2">{Object.entries(privateBooking.booking||{}).filter(([,v])=>v).map(([k,v])=><div key={k} className="rounded-lg bg-white/[.04] p-3"><p className="text-xs capitalize text-slate-400">{k.replace(/([A-Z])/g,' $1')}</p><p className="mt-1 break-all text-sm font-semibold text-white">{v}</p></div>)}</div>{privateBooking.seatDetails&&<p className="mt-3 text-sm">Seat details: {privateBooking.seatDetails}</p>}{privateBooking.contactPreference&&<p className="mt-2 text-sm text-slate-300">Contact preference: {privateBooking.contactPreference}</p>}</section></div>}
    {mine.length>0&&<section className="space-y-3"><h2 className="text-lg font-bold">My trip submissions</h2>{mine.map(t=><div key={t._id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#151f36] p-4"><div><p className="font-semibold">{t.destination} · {t.location}</p><p className="text-xs text-slate-400">{t.travelMode} · {dateLabel(t.travelDate)}</p></div><div className="flex items-center gap-3"><span className={'rounded-full px-3 py-1 text-xs '+(t.status==='Approved'?'bg-emerald-400/10 text-emerald-300':t.status==='Rejected'?'bg-rose-400/10 text-rose-300':'bg-amber-400/10 text-amber-200')}>{t.status}</span>{t.status==='Approved'&&<button onClick={()=>revealBooking(t._id)} className="text-xs text-cyan-200 hover:text-cyan-100">View booking details</button>}<button onClick={()=>remove(t._id)} className="text-xs text-rose-300 hover:text-rose-200">Delete</button></div></div>)}</section>}
  </div>
}
