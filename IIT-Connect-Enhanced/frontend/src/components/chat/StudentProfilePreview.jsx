import React, { useEffect, useState } from 'react'
import { api } from '../../utils/api'

const categories = ['All', 'Gallery', 'Events', 'Campus News', 'Placements', 'Study Hub', 'Travel']

export default function StudentProfilePreview({ userId, onClose, onMessage }) {
  const [data, setData] = useState(null)
  const [category, setCategory] = useState('All')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  useEffect(() => {
    let alive = true
    setLoading(true)
    setError('')
    setData(null)
    api.get(`/profile/${userId}`).then(({ data: response }) => {
      if (alive) setData(response)
    }).catch(err => {
      if (alive) setError(err?.response?.data?.message || 'Could not load this profile')
    }).finally(() => alive && setLoading(false))
    return () => { alive = false }
  }, [userId])
  const profile = data?.profile
  const posts = data?.posts || []
  const visible = category === 'All' ? posts : posts.filter(post => post.section === category)
  if (!userId) return null
  return <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-3 sm:p-6" onClick={onClose}>
    <section role="dialog" aria-modal="true" aria-label="Student profile" onClick={e => e.stopPropagation()} className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-slate-700 bg-[#111812] text-[#eef2e9] shadow-2xl">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#111812]/95 px-5 py-4 backdrop-blur">
        <span className="text-sm font-semibold tracking-wide">STUDENT PROFILE</span>
        <button onClick={onClose} className="rounded-full px-3 py-1 text-xl text-slate-300 hover:bg-white/10" aria-label="Close profile">×</button>
      </div>
      {loading ? <div className="p-14 text-center text-slate-400">Loading profile…</div> : error ? <div className="p-14 text-center text-rose-300">{error}</div> : profile && <>
        <div className="flex flex-col gap-6 border-b border-white/10 px-6 py-8 sm:flex-row sm:items-center sm:gap-12 sm:px-10">
          <div className="mx-auto h-28 w-28 shrink-0 overflow-hidden rounded-full border-2 border-[#a8c69a] bg-slate-800 sm:mx-0 sm:h-36 sm:w-36">
            {profile.photoUrl ? <img src={profile.photoUrl} alt={profile.name} className="h-full w-full object-cover"/> : <div className="flex h-full items-center justify-center text-4xl">{(profile.name || 'S')[0]}</div>}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3"><h2 className="text-2xl font-semibold">{profile.name}</h2><button onClick={onMessage} className="rounded-xl bg-[#a8c69a] px-4 py-2 text-sm font-semibold text-[#142014] hover:bg-[#bdd5ae]">Message</button></div>
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm"><span><b>{posts.length}</b> posts</span><span><b>{profile.connections?.length || 0}</b> connected people</span></div>
            <div className="mt-4 space-y-1 text-sm text-slate-300"><p className="font-medium text-white">{profile.institute || 'Institute not added'}</p><p>{[profile.branch, profile.batch ? `Batch ${profile.batch}` : ''].filter(Boolean).join(' · ')}</p>{profile.rollNumber && <p>Roll no. {profile.rollNumber}</p>}{profile.bio && <p className="mt-2 whitespace-pre-wrap">{profile.bio}</p>}</div>
          </div>
        </div>
        <div className="border-b border-white/10 px-4 py-3"><div className="flex gap-2 overflow-x-auto">{categories.map(item=><button key={item} onClick={()=>setCategory(item)} className={category===item?'shrink-0 rounded-full bg-[#a8c69a] px-4 py-2 text-xs font-semibold text-[#142014]':'shrink-0 rounded-full border border-white/10 px-4 py-2 text-xs text-slate-300 hover:bg-white/5'}>{item}</button>)}</div></div>
        <div className="p-5 sm:p-7">
          {category === 'All' && profile.connections?.length > 0 && <div className="mb-6"><h3 className="mb-3 text-sm font-semibold">CONNECTED PEOPLE</h3><div className="flex flex-wrap gap-3">{profile.connections.map(person=><div key={person.id} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-2"><div className="h-9 w-9 overflow-hidden rounded-full bg-slate-700">{person.photoUrl&&<img src={person.photoUrl} alt="" className="h-full w-full object-cover"/>}</div><div><p className="text-xs font-medium">{person.name}</p><p className="text-[10px] text-slate-400">{[person.institute,person.branch].filter(Boolean).join(' · ')}</p></div></div>)}</div></div>}
          {!visible.length ? <div className="py-12 text-center text-sm text-slate-500">No {category==='All'?'public posts in the profile yet':category+' posts'}.</div> : <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{visible.map((post,index)=><article key={post._id || index} className="overflow-hidden rounded-2xl border border-white/10 bg-white/[.035]">
            {post.imageUrl && <img src={post.imageUrl} alt={post.caption || 'Post image'} className="max-h-72 w-full object-cover"/>}{post.posterUrl && <img src={post.posterUrl} alt={post.title || 'Event poster'} className="max-h-72 w-full object-cover"/>}
            <div className="p-4"><div className="mb-2 flex items-center justify-between gap-2"><span className="rounded-full bg-[#a8c69a]/15 px-2.5 py-1 text-[10px] font-semibold text-[#b9d3aa]">{post.section}</span><time className="text-[10px] text-slate-500">{post.createdAt ? new Date(post.createdAt).toLocaleDateString() : ''}</time></div><h4 className="font-semibold">{post.title || post.companyName || post.destination || post.subject || post.caption || 'Shared post'}</h4><p className="mt-2 whitespace-pre-wrap break-words text-sm text-slate-300">{post.text || post.description || post.body || ''}</p>{post.venue && <p className="mt-2 text-xs text-slate-400">📍 {post.venue}</p>}{post.datetime && <p className="text-xs text-slate-400">{new Date(post.datetime).toLocaleString()}</p>}{post.companyName && <p className="mt-1 text-xs text-slate-400">{post.role} {post.ctc&&'· '+post.ctc}</p>}</div>
          </article>)}</div>}
        </div>
      </>}
    </section>
  </div>
}
