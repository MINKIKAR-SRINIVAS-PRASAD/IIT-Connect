import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { api } from '../../utils/api'
import { Plane, TrainFront, BusFront, ShieldCheck, ArrowLeft, Send } from 'lucide-react'

const inputClass = 'mt-2 w-full rounded-xl border border-slate-700/80 bg-[#111a30] px-3.5 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/10'
const fields = {
 Train:[['trainName','Train name','text'],['trainNumber','Train number','text'],['pnr','PNR','text'],['bookingStatus','Booking status','select'],['coach','Coach number','text'],['seat','Seat / berth number','text'],['berthType','Berth type','text'],['boardingStation','Boarding station','text'],['arrivalStation','Destination station','text'],['departureDate','Departure date','date'],['departureTime','Departure time','time'],['arrivalDate','Arrival date','date'],['arrivalTime','Arrival time','time']],
 Bus:[['operator','Bus operator','text'],['serviceNumber','Service number','text'],['busType','Bus type','text'],['ticketReference','Ticket reference','text'],['seatNumber','Seat number','text'],['boardingPoint','Boarding point','text'],['dropPoint','Drop point','text'],['departureDate','Departure date','date'],['departureTime','Departure time','time'],['arrivalDate','Arrival date','date'],['arrivalTime','Arrival time','time']],
 Flight:[['airline','Airline','text'],['flightNumber','Flight number','text'],['airlinePnr','Airline PNR','text'],['bookingReference','Booking reference','text'],['flightSeat','Seat number','text'],['departureAirport','Departure airport','text'],['arrivalAirport','Arrival airport','text'],['departureDate','Departure date','date'],['departureTime','Departure time','time'],['arrivalDate','Arrival date','date'],['arrivalTime','Arrival time','time']]
}
const empty = Object.fromEntries(Object.values(fields).flat().filter(([k])=>k!=='bookingStatus').map(([k])=>[k,'']))
function Icon({mode}) { const I=mode==='Train'?TrainFront:mode==='Bus'?BusFront:Plane; return <I size={18}/> }
export default function TravelHome() {
 const navigate=useNavigate()
 const draft=useMemo(()=>{try{return JSON.parse(sessionStorage.getItem('iitconnect_trip_draft')||'null')}catch{return null}},[])
 const [mode,setMode]=useState('Train'),[booking,setBooking]=useState({...empty,bookingStatus:'Confirmed'}),[saving,setSaving]=useState(false)
 const [error,setError]=useState('')
 function change(e){setBooking(p=>({...p,[e.target.name]:e.target.value}));setError('')}
 async function submit(e){
  e.preventDefault()
  if(!draft){setError('Trip overview is missing. Please complete the Trip page first.');return}
  if(Object.values(draft).some(v=>!String(v??'').trim())){setError('Trip overview is incomplete. Return to the Trip page and complete every field.');return}
  if(!Number.isFinite(Number(draft.budget))||Number(draft.budget)<=0){setError('Trip budget must be greater than zero.');return}
  if(draft.date<new Date().toISOString().slice(0,10)){setError('Trip start date cannot be in the past.');return}
  const missing=fields[mode].filter(([key])=>!String(booking[key]||'').trim())
  if(missing.length){setError('Please complete every required '+mode+' booking field.');return}
  if(booking.arrivalDate<booking.departureDate){setError('Arrival date cannot be before departure date.');return}
  if(booking.departureDate<draft.date){setError('Departure date cannot be before the trip start date.');return}
  if(booking.arrivalDate===booking.departureDate && booking.arrivalTime<booking.departureTime){setError('Arrival time must be later than departure time.');return}
  setSaving(true)
  try{
   await api.post('/travel',{...draft,members:Number(draft.members),travelMode:mode,booking})
   sessionStorage.removeItem('iitconnect_trip_draft')
   toast.success('Trip submitted for admin approval.')
   navigate('/app/trip')
  }catch(e){setError(e?.response?.data?.message||'Could not submit trip. Please check the details and try again.')}
  finally{setSaving(false)}
 }
 if(!draft)return <div className="rounded-2xl border border-amber-300/20 bg-[#17243d] p-6 text-slate-200"><h2 className="text-xl font-bold">No trip overview found</h2><p className="mt-2 text-sm text-slate-400">Start on the Trip page and complete the overview before entering your booking details.</p><button onClick={()=>navigate('/app/trip')} className="mt-4 rounded-xl bg-cyan-500 px-4 py-2 font-semibold text-white">Go to Trip</button></div>
 return <div className="space-y-6 text-slate-100">
  <header className="rounded-[26px] border border-indigo-300/15 bg-[radial-gradient(ellipse_at_85%_5%,rgba(34,211,238,.2),transparent_35%),linear-gradient(120deg,#151b3b,#102b43_60%,#102f39)] p-6 md:p-8"><button type="button" onClick={()=>navigate('/app/trip')} className="mb-5 inline-flex items-center gap-2 text-sm text-cyan-200 hover:text-white"><ArrowLeft size={16}/> Back to Trip</button><p className="text-xs font-bold uppercase tracking-[.18em] text-cyan-300">New journey · Step 2 of 2</p><h1 className="mt-1 text-3xl font-black">Travel Home</h1><p className="mt-2 text-sm text-slate-300">Enter your complete transport booking details. Every field is mandatory.</p><div className="mt-5 rounded-xl border border-white/10 bg-black/10 p-4 text-sm"><b>{draft.destination}</b><span className="mx-2 text-cyan-300">·</span>{draft.location}<p className="mt-1 text-xs text-slate-400">{draft.category} · {draft.date} · Budget ₹{draft.budget} per person</p></div></header>
  <form onSubmit={submit} className="space-y-6 rounded-3xl border border-cyan-300/20 bg-gradient-to-br from-[#182443] to-[#10192c] p-5 shadow-2xl md:p-7">
   <div><h2 className="text-lg font-bold text-indigo-100">Booking details</h2><p className="mt-1 text-sm text-slate-400">Select your transport type. All fields for the selected transport are required.</p></div>
   <div className="grid grid-cols-3 gap-2">{['Train','Bus','Flight'].map(m=><button type="button" key={m} onClick={()=>{setMode(m);setError('')}} className={'flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-semibold '+(mode===m?'border-cyan-300/50 bg-cyan-300/15 text-cyan-100':'border-white/10 bg-[#101a30] text-slate-400 hover:border-white/25')}><Icon mode={m}/>{m}</button>)}</div>
   <div className="grid gap-4 rounded-2xl border border-white/10 bg-[#0d172b]/70 p-4 md:grid-cols-2">{fields[mode].map(([key,label,type])=><label key={key} className="block text-sm text-slate-300">{label}{type==='select'?<select required name={key} value={booking[key]||'Confirmed'} onChange={change} className={inputClass}><option value="Confirmed">Confirmed</option><option value="RAC">RAC</option><option value="Waiting List">Waiting List</option><option value="Booked">Booked</option></select>:<input required name={key} type={type} value={booking[key]||''} onChange={change} className={inputClass}/>}</label>)}</div>
   <div className="flex gap-3 rounded-2xl border border-amber-300/15 bg-amber-300/[.06] p-4"><ShieldCheck size={19} className="mt-0.5 shrink-0 text-amber-200"/><p className="text-xs leading-5 text-slate-300"><b className="text-amber-100">Your booking privacy matters.</b> PNRs, ticket references, seat and coach details are private. Admin can review the full booking. Other students see only public trip information unless you explicitly accept their request to share private details.</p></div>
   {error&&<p role="alert" className="rounded-xl border border-rose-300/20 bg-rose-300/10 p-3 text-sm text-rose-200">{error}</p>}
   <button disabled={saving} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 px-5 py-4 font-bold text-white shadow-lg transition hover:brightness-110 disabled:opacity-50">{saving?'Submitting…':'Submit trip for admin approval'}<Send size={17}/></button>
  </form>
 </div>
}
