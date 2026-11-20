import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, CalendarDays, Users, ArrowRight, Compass } from 'lucide-react'

const categories = ['Trekking', 'Weekend Trips', 'Pilgrimage', 'Adventure', 'Sightseeing']
const inputClass = 'mt-2 w-full rounded-xl border border-slate-700/80 bg-[#111a30] px-3.5 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/10'

export default function Trip() {
  const navigate = useNavigate()
  const [form,setForm] = useState(() => { try { return JSON.parse(sessionStorage.getItem('iitconnect_trip_draft') || 'null') || {destination:'',location:'',category:'Weekend Trips',date:'',budget:'',members:'1',description:''} } catch { return {destination:'',location:'',category:'Weekend Trips',date:'',budget:'',members:'1',description:''} } })
  const [error,setError] = useState('')
  function change(e) { setForm(p=>({...p,[e.target.name]:e.target.value})); setError('') }
  function next(e) {
    e.preventDefault()
    if (Object.values(form).some(v=>!String(v).trim())) { setError('Please complete every field before continuing.'); return }
    if (!Number.isFinite(Number(form.budget)) || Number(form.budget) <= 0) { setError('Enter a valid budget greater than zero.'); return }
    if (form.date < new Date().toISOString().slice(0,10)) { setError('Trip start date cannot be in the past.'); return }
    if (form.description.trim().length < 5) { setError('Trip description must contain at least 5 characters.'); return }
    if (Number(form.members)<1 || Number(form.members)>50) { setError('Maximum members must be between 1 and 50.'); return }
    sessionStorage.setItem('iitconnect_trip_draft',JSON.stringify(form))
    navigate('/app/travel-home')
  }
  return <div className="space-y-7 text-slate-100">
    <section className="relative overflow-hidden rounded-[28px] border border-indigo-300/15 bg-[radial-gradient(ellipse_at_82%_8%,rgba(34,211,238,.22),transparent_34%),radial-gradient(ellipse_at_5%_100%,rgba(139,92,246,.25),transparent_38%),linear-gradient(120deg,#151b3b,#102b43_58%,#102f39)] p-6 shadow-xl md:p-9">
      <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-200/20 bg-cyan-200/10 px-3 py-1.5 text-xs font-semibold tracking-wide text-cyan-100"><Compass size={14}/> IIT CONNECT · TRIP COMMUNITY</div>
      <h1 className="text-4xl font-black tracking-tight md:text-5xl">Plan your next<br/><span className="bg-gradient-to-r from-cyan-200 via-indigo-200 to-violet-300 bg-clip-text text-transparent">journey together.</span></h1>
      <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300 md:text-base">Start with your trip overview. Add your train, bus or flight booking information on the separate Travel Home page.</p>
    </section>
    <section className="overflow-hidden rounded-3xl border border-cyan-300/20 bg-gradient-to-br from-[#182443] to-[#10192c] shadow-2xl shadow-black/30">
      <header className="border-b border-white/10 bg-white/[.035] px-5 py-5 md:px-7"><p className="text-xs font-bold uppercase tracking-[.18em] text-cyan-300">New journey · Step 1 of 2</p><h2 className="mt-1 text-2xl font-bold">Trip overview</h2><p className="mt-1 text-sm text-slate-400">All fields are mandatory.</p></header>
      <form onSubmit={next} className="space-y-5 p-5 md:p-7">
        <div className="grid gap-5 md:grid-cols-2">
          <label className="block text-sm text-slate-300">Destination<input required name="destination" value={form.destination} onChange={change} className={inputClass} placeholder="e.g. Hyderabad"/></label>
          <label className="block text-sm text-slate-300">City / State / Country<input required name="location" value={form.location} onChange={change} className={inputClass} placeholder="e.g. Hyderabad, Telangana, India"/></label>
          <label className="block text-sm text-slate-300">Category<select required name="category" value={form.category} onChange={change} className={inputClass}>{categories.map(c=><option key={c}>{c}</option>)}</select></label>
          <label className="block text-sm text-slate-300">Trip start date<input required type="date" min={new Date().toISOString().slice(0,10)} name="date" value={form.date} onChange={change} className={inputClass}/></label>
          <label className="block text-sm text-slate-300">Budget per person (₹)<input required type="number" min="1" name="budget" value={form.budget} onChange={change} className={inputClass} placeholder="Enter amount"/></label>
          <label className="block text-sm text-slate-300">Maximum members<input required type="number" min="1" max="50" name="members" value={form.members} onChange={change} className={inputClass}/></label>
          <label className="block text-sm text-slate-300 md:col-span-2">Trip description<textarea required minLength="5" maxLength="1000" rows="4" name="description" value={form.description} onChange={change} className={inputClass} placeholder="Share your plan, itinerary and what kind of travel partners you're looking for."/></label>
        </div>
        {error&&<p role="alert" className="rounded-xl border border-rose-300/20 bg-rose-300/10 p-3 text-sm text-rose-200">{error}</p>}
        <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 px-5 py-4 font-bold text-white shadow-lg transition hover:brightness-110">Continue to Travel Home <ArrowRight size={18}/></button>
      </form>
    </section>
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#121d33] p-4 text-sm text-slate-400"><MapPin size={18} className="shrink-0 text-cyan-300"/> Your trip overview is kept as a draft while you add the booking details on the next page.</div>
  </div>
}
