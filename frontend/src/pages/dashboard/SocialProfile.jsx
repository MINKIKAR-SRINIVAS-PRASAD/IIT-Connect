import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { LockKeyhole, Globe2, Users, Image as ImageIcon, CalendarDays, Plane, BriefcaseBusiness, MoreHorizontal, MessageCircle, Settings, Camera, UserRoundPlus, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { api } from '../../utils/api'
import { useAuth } from '../../hooks/useAuth'

const tabs = [
  { id: 'posts', label: 'Posts', icon: ImageIcon },
  { id: 'private', label: 'Private', icon: LockKeyhole },
  { id: 'public', label: 'Public', icon: Globe2 },
  { id: 'events', label: 'Events', icon: CalendarDays, to: '/app/events' },
  { id: 'more', label: 'More', icon: MoreHorizontal, to: '/app/travel' }
]
const initials = (name = 'Student') => name.trim().split(/\\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase()
const getAvatar = (person) => person?.profile?.photoUrl || person?.profile?.avatarUrl || person?.profile?.avatar || ''
const getName = (person) => person?.profile?.name?.trim() || 'Student'

export default function SocialProfile() {
  const { user } = useAuth()
  const [connections, setConnections] = useState([])
  const [posts, setPosts] = useState([])
  const [tab, setTab] = useState('posts')
  const [loading, setLoading] = useState(true)
  const profile = user?.profile || {}
  const name = profile.name?.trim() || user?.email?.split('@')[0] || 'Student'
  const handle = user?.username || user?.profile?.username || user?.email?.split('@')[0] || 'student'

  useEffect(() => {
    let active = true
    Promise.all([api.get('/chat/requests'), api.get('/gallery/mine')])
      .then(([c, p]) => {
        if (!active) return
        setConnections(Array.isArray(c.data?.connections) ? c.data.connections : [])
        setPosts(Array.isArray(p.data?.posts) ? p.data.posts : [])
      })
      .catch(error => {
        if (active) toast.error(error?.response?.data?.message || 'Could not load your profile content')
      })
      .finally(() => active && setLoading(false))
    return () => { active = false }
  }, [])

  const approved = useMemo(() => posts.filter(post => String(post.status).toLowerCase() === 'approved'), [posts])
  // Privacy labels are honored when the post API supplies them. Legacy posts without
  // a visibility field remain in the public grid until privacy is supported server-side.
  const privatePosts = approved.filter(post => post.visibility === 'connections' || post.visibility === 'private')
  const publicPosts = approved.filter(post => !post.visibility || post.visibility === 'public')
  const shown = tab === 'private' ? privatePosts : tab === 'public' ? publicPosts : approved

  const shareProfile = async () => {
    const url = window.location.origin + '/app/profile'
    try {
      if (navigator.share) await navigator.share({ title: name + ' · IITStudentsOS', url })
      else { await navigator.clipboard?.writeText(url); toast.success('Profile link copied') }
    } catch (error) {
      if (error?.name !== 'AbortError') toast.error('Could not share profile')
    }
  }

  return <main className="mx-auto w-full max-w-4xl space-y-6 pb-10 text-slate-100">
    <section className="rounded-2xl border border-slate-800/80 bg-[#111a16] p-4 sm:p-7">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0"><p className="text-xs uppercase tracking-[0.18em] text-emerald-400">Your profile</p><h1 className="mt-1 truncate text-xl font-bold sm:text-2xl">{handle}</h1></div>
        <Link to="/app/profile/edit" aria-label="Profile settings" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800"><Settings size={18}/></Link>
      </div>
      <div className="mt-6 grid grid-cols-[92px_1fr] items-center gap-4 sm:grid-cols-[150px_1fr] sm:gap-8">
        <div className="relative h-24 w-24 rounded-full bg-gradient-to-tr from-amber-400 via-rose-500 to-violet-600 p-[3px] sm:h-36 sm:w-36">
          <div className="h-full w-full overflow-hidden rounded-full border-4 border-[#111a16] bg-slate-900">
            {getAvatar(user) ? <img src={getAvatar(user)} alt={name} className="h-full w-full object-cover"/> : <div className="flex h-full items-center justify-center text-3xl font-bold">{initials(name)}</div>}
          </div>
          <Link to="/app/profile/edit" aria-label="Change profile photo" className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#111a16] bg-emerald-400 text-slate-950"><Camera size={15}/></Link>
        </div>
        <div className="min-w-0">
          <div className="mb-4 flex flex-wrap items-center gap-2"><h2 className="truncate text-lg font-semibold sm:text-xl">{name}</h2><span className="rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] font-medium text-emerald-300">IITStudentsOS</span></div>
          <div className="grid grid-cols-3 gap-1 sm:gap-6">
            <div className="text-center sm:text-left"><strong className="block text-xl sm:text-2xl">{approved.length}</strong><span className="text-xs text-slate-400 sm:text-sm">posts</span></div>
            <div className="text-center sm:text-left"><strong className="block text-xl sm:text-2xl">{connections.length}</strong><span className="text-xs text-slate-400 sm:text-sm">connections</span></div>
            <div className="text-center sm:text-left"><strong className="block text-xl sm:text-2xl">{publicPosts.length}</strong><span className="text-xs text-slate-400 sm:text-sm">public</span></div>
          </div>
        </div>
      </div>
      <div className="mt-5 space-y-1 text-sm leading-6">
        <p className="font-semibold">{profile.name || name}</p>
        {profile.bio ? <p className="whitespace-pre-line text-slate-300">{profile.bio}</p> : <p className="text-slate-500">Add a bio to tell your campus story…</p>}
        {(profile.branch || profile.batch) && <p className="text-slate-400">{[profile.branch, profile.batch].filter(Boolean).join(' · ')}</p>}
        {profile.iit && <p className="text-slate-400">{profile.iit} 🎓</p>}
      </div>
      <div className="mt-5 grid grid-cols-2 gap-2 sm:flex">
        <Link to="/app/profile/edit" className="rounded-xl bg-emerald-400 px-4 py-2.5 text-center text-sm font-semibold text-slate-950 hover:bg-emerald-300 sm:flex-1">Edit profile</Link>
        <button onClick={shareProfile} className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-semibold hover:bg-slate-800 sm:flex-1">Share profile</button>
        <Link to="/app/chat" className="col-span-2 flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-semibold hover:bg-slate-800 sm:flex-1"><UserRoundPlus size={16}/> Find connections</Link>
      </div>
    </section>

    {connections.length > 0 && <section className="rounded-2xl border border-slate-800/80 bg-[#111a16] p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between"><div><h2 className="font-semibold">Your connections</h2><p className="mt-1 text-xs text-slate-500">People in your campus network</p></div><Link to="/app/chat" className="flex items-center gap-1 text-xs text-emerald-300">See all <ChevronRight size={14}/></Link></div>
      <div className="flex gap-4 overflow-x-auto pb-1">
        {connections.slice(0,12).map(row => { const person = row.user || row; const personName = getName(person); return <div key={row._id || person._id} className="w-16 shrink-0 text-center">
          <div className="mx-auto h-14 w-14 rounded-full bg-gradient-to-tr from-emerald-400 to-cyan-500 p-[2px]"><div className="h-full w-full overflow-hidden rounded-full bg-slate-900">{getAvatar(person) ? <img src={getAvatar(person)} alt={personName} className="h-full w-full object-cover"/> : <div className="flex h-full items-center justify-center text-sm font-semibold">{initials(personName)}</div>}</div></div>
          <p className="mt-2 truncate text-xs text-slate-300">{personName}</p>
        </div>})}
      </div>
    </section>}

    <section className="overflow-hidden rounded-2xl border border-slate-800/80 bg-[#111a16]">
      <div className="grid grid-cols-5 border-b border-slate-800">
        {tabs.map(item => item.to ? <Link key={item.id} to={item.to} aria-label={item.label} className="flex flex-col items-center justify-center gap-1 py-3 text-slate-400 hover:text-white"><item.icon size={19}/><span className="hidden text-[10px] sm:block">{item.label}</span></Link> : <button key={item.id} onClick={() => setTab(item.id)} aria-label={item.label} className={`flex flex-col items-center justify-center gap-1 border-b-2 py-3 ${tab === item.id ? 'border-emerald-400 text-emerald-300' : 'border-transparent text-slate-500 hover:text-slate-200'}`}><item.icon size={19}/><span className="hidden text-[10px] sm:block">{item.label}</span></button>)}
      </div>
      {(tab === 'private' || tab === 'public' || tab === 'posts') && <div className="p-3 sm:p-5">
        <div className="mb-3 flex items-center justify-between gap-2"><h2 className="text-sm font-semibold text-slate-300">{tab === 'private' ? 'Private posts · connections only' : tab === 'public' ? 'Public posts' : 'Your posts'}</h2><Link to="/app/gallery" className="text-xs text-emerald-300">Open gallery</Link></div>
        {loading ? <div className="grid grid-cols-3 gap-1.5 sm:gap-3">{[0,1,2,3,4,5].map(n => <div key={n} className="aspect-square animate-pulse rounded-sm bg-slate-900"/>)}</div> : shown.length ? <div className="grid grid-cols-3 gap-1.5 sm:gap-3">{shown.map(post => <Link key={post._id} to="/app/gallery" className="group relative aspect-square overflow-hidden rounded-sm bg-slate-900"><img src={post.imageUrl} alt={post.caption || 'Post'} loading="lazy" className="h-full w-full object-cover transition duration-300 group-hover:scale-105"/><span className="absolute left-2 top-2 rounded-md bg-black/65 p-1 text-white">{post.visibility === 'connections' || post.visibility === 'private' ? <LockKeyhole size={13}/> : <Globe2 size={13}/>}</span>{post.caption && <span className="absolute bottom-0 line-clamp-2 w-full bg-black/65 p-1.5 text-[10px] sm:text-xs">{post.caption}</span>}</Link>)}</div> : <div className="py-12 text-center"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-slate-700 text-slate-500">{tab === 'private' ? <LockKeyhole size={20}/> : <ImageIcon size={20}/>}</div><p className="mt-3 text-sm text-slate-400">{tab === 'private' ? 'No private posts yet' : 'No approved posts yet'}</p><p className="mt-1 text-xs text-slate-600">{tab === 'private' ? 'Share moments just with your connections.' : 'Your approved campus moments will appear here.'}</p><Link to="/app/gallery" className="mt-4 inline-block rounded-lg bg-emerald-400 px-4 py-2 text-xs font-semibold text-slate-950">Create a post</Link></div>}
      </div>}
      {tab === 'events' && <div className="p-5 text-center"><CalendarDays className="mx-auto text-slate-500"/><p className="mt-2 text-sm text-slate-400">Your campus events</p><Link to="/app/events" className="mt-3 inline-flex text-sm text-emerald-300">Browse events</Link></div>}
      {tab === 'more' && <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3">{[{to:'/app/travel',label:'Travel',icon:Plane},{to:'/app/placements',label:'Placements',icon:BriefcaseBusiness},{to:'/app/chat',label:'Messages',icon:MessageCircle},{to:'/app/gallery',label:'Gallery',icon:ImageIcon}].map(item=><Link key={item.to} to={item.to} className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950 p-3 text-sm"><item.icon size={17} className="text-emerald-300"/>{item.label}</Link>)}</div>}
    </section>
    <p className="px-2 text-center text-[11px] text-slate-600">Your profile · IITStudentsOS student network</p>
  </main>
}
