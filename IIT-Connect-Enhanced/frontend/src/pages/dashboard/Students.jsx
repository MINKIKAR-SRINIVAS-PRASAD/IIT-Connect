import React,{useEffect,useState} from 'react'
import {Search,UserPlus,Check,Clock,Building2} from 'lucide-react'
import toast from 'react-hot-toast'
import {api} from '../../utils/api'

export default function Students(){
 const [query,setQuery]=useState('')
 const [users,setUsers]=useState([])
 const [requests,setRequests]=useState({incoming:[],outgoing:[],connections:[]})
 const [loading,setLoading]=useState(false),[busy,setBusy]=useState('')
 async function load(){
  setLoading(true)
  try{
   const [u,r]=await Promise.all([api.get('/chat/users',{params:{q:query}}),api.get('/chat/requests')])
   setUsers((u.data.users||[]).filter(x=>x.role==='student'))
   setRequests(r.data||{incoming:[],outgoing:[],connections:[]})
  }catch(e){toast.error(e?.response?.data?.message||'Could not load students')}
  finally{setLoading(false)}
 }
 useEffect(()=>{const t=setTimeout(load,250);return()=>clearTimeout(t)},[query])
 async function connect(id){
  setBusy(id)
  try{await api.post('/chat/connect/'+id);toast.success('Connection request updated');await load()}
  catch(e){toast.error(e?.response?.data?.message||'Could not send request')}
  finally{setBusy('')}
 }
 async function respond(id,action){
  setBusy(id)
  try{await api.patch('/chat/requests/'+id,{action});toast.success(action==='accept'?'Connection accepted':'Request declined');await load()}
  catch(e){toast.error(e?.response?.data?.message||'Could not respond')}
  finally{setBusy('')}
 }
 const outgoing=new Set(requests.outgoing.map(r=>String(r.recipient?._id)))
 const connected=new Set(requests.connections.map(r=>String(r.user?._id)))
 const incomingById=new Map(requests.incoming.map(r=>[String(r._id),r]))
 const pendingIncoming=new Map(requests.incoming.map(r=>[String(r.requester?._id),r]))
 return <div className="space-y-5 text-slate-100">
  <header><p className="text-xs font-bold tracking-[.18em] text-emerald-300">CROSS-IIT STUDENT NETWORK</p><h1 className="mt-2 text-3xl font-bold">Find students</h1><p className="mt-2 text-sm text-slate-400">Discover students across IITs. Private chat opens after a connection is accepted.</p></header>
  <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[.04] px-4 py-3"><Search size={18} className="text-slate-400"/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search name, IIT or branch…" className="w-full bg-transparent text-sm outline-none"/></label>
  {requests.incoming.length>0&&<section className="rounded-2xl border border-amber-300/20 bg-amber-300/[.04] p-4"><h2 className="font-semibold">Incoming requests ({requests.incoming.length})</h2><div className="mt-3 space-y-2">{requests.incoming.map(r=><div key={r._id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-black/20 p-3"><span className="text-sm">{r.requester?.profile?.name||'Student'} · {r.requester?.profile?.iit||r.requester?.profile?.institute||'IIT'}</span><div className="flex gap-2"><button disabled={!!busy} onClick={()=>respond(r._id,'accept')} className="rounded-lg bg-emerald-300 px-3 py-1.5 text-xs font-bold text-black">Accept</button><button disabled={!!busy} onClick={()=>respond(r._id,'reject')} className="rounded-lg border border-white/10 px-3 py-1.5 text-xs">Decline</button></div></div>)}</div></section>}
  <section className="grid gap-3 sm:grid-cols-2">{loading?<p className="text-sm text-slate-400">Searching…</p>:users.map(u=>{
   const id=String(u._id),isConnected=connected.has(id),isPending=outgoing.has(id),incoming=pendingIncoming.get(id)
   return <article key={id} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[.035] p-4"><div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-emerald-300/10 text-lg font-bold text-emerald-200">{u.profile?.photoUrl||u.profile?.avatar?<img src={u.profile.photoUrl||u.profile.avatar} alt="" className="h-full w-full object-cover"/>:(u.profile?.name||'?').slice(0,1)}</div><div className="min-w-0 flex-1"><div className="truncate font-semibold">{u.profile?.name||'Student'}</div><div className="mt-1 flex items-center gap-1 truncate text-xs text-slate-400"><Building2 size={12}/>{u.profile?.iit||u.profile?.institute||'Institute not set'}{u.profile?.branch?' · '+u.profile.branch:''}</div></div>{isConnected?<span className="flex items-center gap-1 text-xs text-emerald-300"><Check size={14}/>Connected</span>:incoming?<button disabled={!!busy} onClick={()=>respond(incoming._id,'accept')} className="rounded-xl bg-emerald-300 px-3 py-2 text-xs font-bold text-black">Accept</button>:isPending?<span className="flex items-center gap-1 text-xs text-amber-200"><Clock size={14}/>Pending</span>:<button disabled={!!busy} onClick={()=>connect(id)} className="flex items-center gap-1 rounded-xl border border-emerald-300/20 px-3 py-2 text-xs text-emerald-200"><UserPlus size={14}/>{busy===id?'…':'Connect'}</button>}</article>
  })}</section>
  {!loading&&!users.length&&<p className="rounded-xl border border-white/10 p-5 text-sm text-slate-400">No students found. Try another name or institute.</p>}
 </div>
}
