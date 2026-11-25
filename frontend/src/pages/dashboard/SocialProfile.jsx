import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { LockKeyhole, Globe2, Users, Image as ImageIcon, CalendarDays, Plane, BriefcaseBusiness, MoreHorizontal, MessageCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { api } from '../../utils/api'
import { useAuth } from '../../hooks/useAuth'

const tabs = [
  { id: 'private', label: 'Private posts', icon: LockKeyhole },
  { id: 'public', label: 'Public post', icon: Globe2 },
  { id: 'gallery', label: 'Gallery', icon: ImageIcon, to: '/app/gallery' },
  { id: 'events', label: 'Events', icon: CalendarDays, to: '/app/events' },
  { id: 'more', label: 'More', icon: MoreHorizontal, to: '/app/travel' }
]
const initials = (name = 'Student') => name.trim().split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase()

export default function SocialProfile() {
  const { user } = useAuth()
  const [connections, setConnections] = useState([])
  const [posts, setPosts] = useState([])
  const [tab, setTab] = useState('private')
  const [loading, setLoading] = useState(true)
  const profile = user?.profile || {}
  const name = profile.name?.trim() || user?.email?.split('@')[0] || 'Student'

  useEffect(() => {
    let active = true
    Promise.all([api.get('/chat/requests'), api.get('/gallery/mine')])
      .then(([c, p]) => {
        if (!active) return
        setConnections(c.data?.connections || [])
        setPosts(p.data?.posts || [])
      })
      .catch(error => toast.error(error?.response?.data?.message || 'Could not load profile'))
      .finally(() => active && setLoading(false))
    return () => { active = false }
  }, [])

  const approved = useMemo(() => posts.filter(p => p.status === 'Approved'), [posts])
  const privatePosts = approved.filter(p => p.visibility === 'connections')
  const publicPosts = approved.filter(p => p.visibility !== 'connections')
  const shown = tab === 'private' ? privatePosts : tab === 'public' ? publicPosts : []

  return <main className="mx-auto w-full max-w-4xl space-y-7 pb-8 text-slate-100">
    <section className="px-1 pt-3 sm:px-3">
      <div className="grid grid-cols-[112px_1fr] items-center gap-4 sm:grid-cols-[180px_1fr] sm:gap-8">
        <div className="relative h-28 w-28 rounded-full border-[5px] border-slate-700 bg-slate-900 p-1 sm:h-44 sm:w-44">
          <div className="h-full w-full overflow-hidden rounded-full bg-slate-800">
            {profile.photoUrl ? <img src={profile.photoUrl} alt={name} className="h-full w-full object-cover"/> : <div className="flex h-full items-center justify-center text-3xl font-bold text-slate-300">{initials(name)}</div>}
          </div>
          <Link to="/app/profile/edit" aria-label="Edit profile photo" className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#0b0e13] bg-white text-xl font-bold text-slate-900">+</Link>
        </div>
        <div className="min-w-0">
          <div className="mb-4 flex items-center gap-2"><h1 className="truncate text-base font-bold sm:text-xl">{name}</h1><span className="h-2 w-2 rounded-full bg-rose-500"/></div>
          <div className="grid grid-cols-3 gap-1 sm:gap-5">
            <div className="text-center sm:text-left"><strong className="block text-xl sm:text-2xl">{posts.length}</strong><span className="text-xs text-slate-300 sm:text-sm">private post</span></div>
            <div className="text-center sm:text-left"><strong className="block text-xl sm:text-2xl">{publicPosts.length}</strong><span className="text-xs text-slate-300 sm:text-sm">public posts</span></div>
            <div className="text-center sm:text-left"><strong className="block text-xl sm:text-2xl">{connections.length}</strong><span className="text-xs text-slate-300 sm:text-sm">connected people</span></div>
          </div>
        </div>
      </div>
      <div className="mt-5 space-y-1.5 text-sm leading-6">
        {profile.bio ? <p className="whitespace-pre-line">{profile.bio}</p> : <p className="italic text-slate-500">Your bio goes here…</p>}
        {profile.branch && <p>{profile.branch}{profile.batch ? ' · '+profile.batch : ''}</p>}
        {profile.iit && <p>{profile.iit} 🎓</p>}
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        <Link to="/app/profile/edit" className="flex-1 rounded-xl bg-[#292d34] px-3 py-3 text-center text-sm font-semibold hover:bg-[#343942]">Edit profile</Link>
        <button onClick={() => { if (navigator.share) navigator.share({ title: name+' | IITStudentsOS', url: window.location.href }).catch(() => {}); else { navigator.clipboard?.writeText(window.location.href); toast.success('Profile link copied') } }} className="flex-1 rounded-xl bg-[#292d34] px-3 py-3 text-sm font-semibold hover:bg-[#343942]">Share profile</button>
        <Link to="/app/chat" aria-label="Connect with people" className="flex items-center justify-center rounded-xl bg-[#292d34] px-4 hover:bg-[#343942]"><Users size={20}/></Link>
      </div>
    </section>

    <section className="border-b border-slate-800 pb-4">
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4">
        {tabs.map(item => item.to ? <Link key={item.id} to={item.to} className="rounded-xl bg-black px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800 sm:text-base">{item.label}</Link> : <button key={item.id} onClick={() => setTab(item.id)} className={`rounded-xl px-3 py-2 text-sm font-semibold sm:text-base ${tab === item.id ? 'bg-black text-white ring-1 ring-slate-700' : 'text-slate-400 hover:bg-slate-900'}`}>{item.label}</button>)}
      </div>
    </section>

    {tab === 'private' || tab === 'public' ? <section>
      <div className="mb-3 flex items-center justify-between"><h2 className="text-sm font-semibold text-slate-300">{tab === 'private' ? 'Private posts · connections only' : 'Public posts · everyone'}</h2><Link to="/app/gallery" className="text-xs text-indigo-300">Open gallery</Link></div>
      {loading ? <div className="grid grid-cols-3 gap-1 sm:gap-2">{[0,1,2].map(n => <div key={n} className="aspect-square animate-pulse bg-slate-900"/>)}</div> : shown.length ? <div className="grid grid-cols-3 gap-1 sm:gap-2">{shown.map(post => <Link key={post._id} to="/app/gallery" className="relative aspect-square overflow-hidden bg-slate-900"><img src={post.imageUrl} alt={post.caption || 'Post'} loading="lazy" className="h-full w-full object-cover"/>{post.caption && <span className="absolute bottom-0 line-clamp-2 w-full bg-black/60 p-1 text-[10px] sm:text-xs">{post.caption}</span>}</Link>)}</div> : <div className="py-12 text-center text-sm text-slate-500">No approved {tab} posts yet.</div>}
    </section> : <section className="grid grid-cols-2 gap-3 sm:grid-cols-3">{[
      {to:'/app/gallery',label:'Gallery',icon:ImageIcon},{to:'/app/events',label:'Events',icon:CalendarDays},{to:'/app/travel',label:'Travel',icon:Plane},{to:'/app/placements',label:'Placement Cell',icon:BriefcaseBusiness},{to:'/app/chat',label:'Connected people',icon:MessageCircle}
    ].map(item => <Link key={item.to} to={item.to} className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950 p-4"><item.icon size={19} className="text-slate-400"/><span className="text-sm font-medium">{item.label}</span></Link>)}</section>}
  </main>
}
