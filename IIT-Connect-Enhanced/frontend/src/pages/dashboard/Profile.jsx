import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import { api } from '../../utils/api'
import { useAuth } from '../../hooks/useAuth'
import NotificationSettings from '../../components/notifications/NotificationSettings.jsx'

export default function Profile() {
  const { user, refresh } = useAuth()
  const navigate = useNavigate()
  const isStudent = user?.role === 'student'

  const [name, setName] = useState('')
  const [rollNumber, setRollNumber] = useState('')
  const [iit, setIit] = useState('')
  const [branch, setBranch] = useState('')
  const [batch, setBatch] = useState('')
  const [bio, setBio] = useState('')
  const [photo, setPhoto] = useState(null)
  const [photoPreview, setPhotoPreview] = useState('')
  const [busy, setBusy] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordBusy, setPasswordBusy] = useState(false)
  const [achievement, setAchievement] = useState(null)
  const [certificateBusy, setCertificateBusy] = useState(false)

  const instituteByDomain = {
    'iitgn.ac.in': 'IIT Gandhinagar', 'iitbbs.ac.in': 'IIT Bhubaneswar', 'iitbhubaneswar.ac.in': 'IIT Bhubaneswar',
    'iitm.ac.in': 'IIT Madras', 'iitg.ernet.in': 'IIT Guwahati', 'iitg.ac.in': 'IIT Guwahati',
    'iiti.ac.in': 'IIT Indore', 'iitk.ac.in': 'IIT Kanpur', 'iitj.ac.in': 'IIT Jodhpur',
    'iitkgp.ac.in': 'IIT Kharagpur', 'iith.ac.in': 'IIT Hyderabad', 'iitb.ac.in': 'IIT Bombay',
    'iitp.ac.in': 'IIT Patna', 'iitd.ac.in': 'IIT Delhi', 'iitrpr.ac.in': 'IIT Ropar',
    'iitmandi.ac.in': 'IIT Mandi', 'iitr.ac.in': 'IIT Roorkee', 'iitbhu.ac.in': 'IIT (BHU) Varanasi',
    'iitjammu.ac.in': 'IIT Jammu', 'iitpkd.ac.in': 'IIT Palakkad', 'iittp.ac.in': 'IIT Tirupati',
    'iitgoa.ac.in': 'IIT Goa', 'iitbhilai.ac.in': 'IIT Bhilai', 'iitdh.ac.in': 'IIT Dharwad',
    'iitism.ac.in': 'IIT (ISM) Dhanbad'
  }
  const emailDomain = String(user?.email || '').toLowerCase().split('@').pop()
  const verifiedInstitute = isStudent
    ? Object.entries(instituteByDomain).find(([domain]) => emailDomain === domain || emailDomain.endsWith('.' + domain))?.[1] || ''
    : ''
  const instituteValue = verifiedInstitute || iit

  useEffect(() => {
    if (!photo) {
      setPhotoPreview('')
      return undefined
    }
    const objectUrl = URL.createObjectURL(photo)
    setPhotoPreview(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [photo])

  useEffect(() => {
    setName(user?.profile?.name || '')
    setRollNumber(user?.profile?.rollNumber || '')
    setIit(user?.profile?.iit || '')
    setBranch(user?.profile?.branch || '')
    setBatch(user?.profile?.batch || '')
    setBio(user?.profile?.bio || '')
  }, [user?.id, user?.email, user?.profile?.iit])

  useEffect(() => {
    if (!user?.id && !user?._id) return
    api.get('/profile/achievements').then(({ data }) => setAchievement(data)).catch(() => {})
  }, [user?.id, user?._id])

  async function downloadCertificate() {
    setCertificateBusy(true)
    try {
      const { data } = await api.post('/profile/achievement-certificate')
      const cert = data.certificate
      const esc = (value) => String(value ?? '').replace(/[&<>\"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '\"': '&quot;', "'": '&#39;' }[ch]))
      const verify = window.location.origin + '/api/profile/achievement-certificate/verify/' + encodeURIComponent(cert.certificateId)
      const html = [
        '<!doctype html><html><head><meta charset="utf-8"><title>IITStudentsOS Platinum Certificate</title>',
        '<style>body{font-family:Georgia,serif;background:#f2f2f2;padding:30px;color:#151515}.frame{background:#fff;border:12px double #b59a52;padding:48px;text-align:center;max-width:900px;margin:auto}.brand{letter-spacing:5px;color:#80651d;font:700 18px Arial}.title{font-size:36px;margin:25px}.student{font-size:32px;border-bottom:1px solid #aaa;padding:12px}.copy{font:18px Arial;line-height:1.8;margin:28px}.seal{margin:28px auto;border:3px solid #b59a52;border-radius:50%;width:105px;height:105px;display:flex;align-items:center;justify-content:center;font:bold 15px Arial;color:#80651d}.small{font:12px Arial;color:#555;overflow-wrap:anywhere}@media print{body{background:white;padding:0}.frame{max-width:none;min-height:85vh}}</style></head><body><main class="frame">',
        '<div class="brand">IITStudentsOS</div><h1 class="title">Certificate of Contribution</h1><p>This certificate is presented to</p><div class="student">' + esc(cert.studentName) + '</div>',
        '<p class="copy">In recognition of sustained, approved contributions to the IITStudentsOS student community, achieving the <b>PLATINUM CONTRIBUTOR</b> milestone with <b>' + Number(cert.contributionPoints).toLocaleString() + ' contribution points</b>.</p>',
        '<div class="seal">PLATINUM<br>10K+</div><p>' + esc(cert.institute) + ' · ' + esc(cert.branch) + ' · ' + esc(cert.batch) + '</p><p>Issued: ' + esc(new Date(cert.issuedAt).toLocaleDateString()) + '</p>',
        '<p class="small">Certificate ID: ' + esc(cert.certificateId) + '</p><p class="small">Verify: ' + esc(verify) + '</p><p class="small">Platform contribution recognition issued by IITStudentsOS; not an official institute-issued academic certificate.</p></main></body></html>'
      ].join('')
      const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = 'IITStudentsOS-' + cert.certificateId + '.html'
      link.click()
      setTimeout(() => URL.revokeObjectURL(link.href), 1200)
      setAchievement((old) => old ? { ...old, certificateId: cert.certificateId } : old)
      toast.success('Certificate generated. Open the downloaded file and print or save as PDF.')
    } catch (error) { toast.error(error?.response?.data?.message || 'Unable to issue certificate') }
    finally { setCertificateBusy(false) }
  }

  async function changePassword(e) {
    e?.preventDefault()
    if (!currentPassword) return toast.error('Enter your current password')
    if (newPassword.length < 8) return toast.error('New password must be at least 8 characters')
    if (newPassword !== confirmPassword) return toast.error('New passwords do not match')
    setPasswordBusy(true)
    try {
      await api.post('/auth/change-password', { currentPassword, newPassword })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      toast.success('Password changed successfully')
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Could not change password')
    } finally { setPasswordBusy(false) }
  }

  const hasPhoto = Boolean(user?.profile?.photoUrl || photo)

  async function save(e) {
    e.preventDefault()

    if (isStudent && (!name.trim() || !iit.trim() || !branch.trim() || !batch.trim() || !hasPhoto)) {
      toast.error('Name, college/institute, branch, batch and profile photo are required')
      return
    }

    setBusy(true)
    try {
      const fd = new FormData()
      fd.append('name', name.trim())
      fd.append('rollNumber', rollNumber.trim().toUpperCase())
      fd.append('iit', iit)
      fd.append('branch', branch.trim())
      fd.append('batch', batch.trim())
      fd.append('bio', bio.trim())
      if (photo) fd.append('photo', photo)

      await api.put('/profile', fd)
      await refresh()
      setPhoto(null)
      toast.success('Profile updated successfully')

      if (isStudent) navigate('/app', { replace: true })
    } catch (e2) {
      toast.error(e2?.response?.data?.message || 'Failed to update profile')
    } finally {
      setBusy(false)
    }
  }


  const [editing, setEditing] = useState(false)
  const [posts, setPosts] = useState([])
  const [postFilter, setPostFilter] = useState('All')
  const [postsLoading, setPostsLoading] = useState(true)

  useEffect(() => {
    let alive = true
    api.get('/posts/feed').then(({ data }) => {
      if (!alive) return
      const all = Array.isArray(data?.posts) ? data.posts : []
      const own = all.filter(post => {
        const author = post.authorId?._id || post.authorId
        return String(author || '') === String(user?._id || user?.id || '')
      })
      setPosts(own)
    }).catch(() => {
      if (alive) setPosts([])
    }).finally(() => alive && setPostsLoading(false))
    return () => { alive = false }
  }, [user?._id, user?.id])

  const publicPosts = posts.filter(post => post.visibility !== 'private')
  const privatePosts = posts.filter(post => post.visibility === 'private')
  const filteredPosts = postFilter === 'All' ? posts : postFilter === 'Private' ? privatePosts : postFilter === 'Public' ? publicPosts : posts.filter(post => post.section?.toLowerCase() === postFilter.toLowerCase())
  const displayName = user?.profile?.name || 'Student'
  const initials = displayName.split(/\\s+/).map(part => part[0]).join('').slice(0, 2).toUpperCase()
  const profilePhoto = photoPreview || user?.profile?.photoUrl
  const shareProfile = async () => {
    const url = window.location.origin + '/app/profile'
    try {
      if (navigator.share) await navigator.share({ title: displayName + ' · IITStudentsOS', url })
      else if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(url); toast.success('Profile link copied') }
      else toast(url)
    } catch (error) { if (error?.name !== 'AbortError') toast.error('Could not share profile') }
  }

  if (editing) {
    return <div className="mx-auto max-w-4xl space-y-3">
      <button type="button" onClick={() => setEditing(false)} className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-300 hover:bg-white/5">← Back to profile</button>
      <form onSubmit={save} className="space-y-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6">
          <div className="mb-5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
            <div className="font-semibold text-emerald-200">Edit your profile</div>
            <p className="mt-1 text-sm text-slate-400">Update your photo, bio and student details. Your profile preview will reflect saved changes.</p>
          </div>
          <div className="flex items-start gap-4">
            <div className="h-20 w-20 overflow-hidden rounded-full border border-white/10 bg-slate-900">
              {photoPreview || user?.profile?.photoUrl ? <img src={photoPreview || user.profile.photoUrl} alt="Profile preview" className="h-full w-full object-cover"/> : <div className="flex h-full items-center justify-center text-slate-400">{initials}</div>}
            </div>
            <div className="flex-1"><div className="text-xl font-semibold">Edit profile</div><div className="text-sm text-slate-400">{user?.email}</div></div>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <Input label="Name *" value={name} required={isStudent} maxLength={80} onChange={e=>setName(e.target.value)}/>
            <Input label="Roll number" value={rollNumber} maxLength={40} onChange={e=>setRollNumber(e.target.value.toUpperCase())} placeholder="xxxxxx"/>
            <Input label="College / institute" value={instituteValue} required={isStudent} maxLength={120} readOnly={isStudent} onChange={isStudent?undefined:e=>setIit(e.target.value)}/>
            <Input label="Branch *" value={branch} required={isStudent} maxLength={80} onChange={e=>setBranch(e.target.value)}/>
            <Input label="Batch *" value={batch} required={isStudent} maxLength={20} onChange={e=>setBatch(e.target.value)} placeholder="2024-2028"/>
          </div>
          <label className="mt-4 block"><span className="mb-1 block text-sm text-slate-300">Bio</span><textarea maxLength={500} className="min-h-[110px] w-full rounded-xl border border-white/10 bg-[#0b100d] px-3 py-2 text-white outline-none focus:border-emerald-300/50" value={bio} onChange={e=>setBio(e.target.value)} placeholder="A little about you…"/></label>
          <label className="mt-4 block"><span className="mb-1 block text-sm text-slate-300">Profile photo</span><input type="file" accept="image/jpeg,image/png,image/webp" className="block w-full text-sm text-slate-300" onChange={e=>setPhoto(e.target.files?.[0]||null)}/></label>
          <div className="mt-5"><Button disabled={busy}>{busy?'Saving…':'Save changes'}</Button></div>
        </div>
        <section className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6">
          <h2 className="text-lg font-semibold">Change password</h2><p className="mt-1 text-sm text-slate-400">Keep your account secure.</p>
          <div className="mt-4 grid gap-3 md:grid-cols-3"><Input label="Current password" type="password" value={currentPassword} onChange={e=>setCurrentPassword(e.target.value)}/><Input label="New password (8+)" type="password" value={newPassword} onChange={e=>setNewPassword(e.target.value)}/><Input label="Confirm new password" type="password" value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)}/><div className="md:col-span-3"><Button type="button" disabled={passwordBusy} onClick={changePassword}>{passwordBusy?'Updating…':'Change password'}</Button></div></div>
        </section>
        <section className="rounded-2xl border border-amber-500/20 bg-slate-950/60 p-6"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs uppercase tracking-widest text-amber-300">Achievements</p><h2 className="mt-1 text-xl font-bold">Contribution streak</h2></div><span className="rounded-full border border-amber-400/30 px-3 py-1 text-sm text-amber-200">{achievement?.level||'Starter'}</span></div><p className="mt-4 text-3xl font-bold">{Number(achievement?.points||0).toLocaleString()} <span className="text-sm font-normal text-slate-400">points</span></p><p className="mt-2 text-sm text-slate-400">Silver 1,000 · Gold 5,000 · Platinum 10,000</p>{isStudent&&achievement?.certificateAvailable&&<button type="button" onClick={downloadCertificate} disabled={certificateBusy} className="mt-4 rounded-xl bg-amber-300 px-4 py-2 font-semibold text-slate-950">{certificateBusy?'Preparing…':'Download Platinum certificate'}</button>}</section>
        <NotificationSettings/>
      </form>
    </div>
  }

  return <main className="mx-auto max-w-5xl pb-8 text-[#f2f5ef]">
    <section className="border-b border-white/[.08] pb-7">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-12">
        <div className="relative mx-auto h-28 w-28 shrink-0 sm:mx-0 sm:h-36 sm:w-36">
          <div className="h-full w-full overflow-hidden rounded-full bg-[#222a24] ring-2 ring-white/15 ring-offset-4 ring-offset-[#101510]">
            {profilePhoto ? <img src={profilePhoto} alt={displayName} className="h-full w-full object-cover"/> : <div className="flex h-full items-center justify-center text-4xl font-semibold text-emerald-200">{initials}</div>}
          </div>
          <button type="button" onClick={()=>setEditing(true)} aria-label="Edit profile photo" className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#101510] bg-[#b8d1a8] text-xl font-bold text-[#101810]">+</button>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3"><h1 className="text-2xl font-semibold tracking-tight">{user?.username || user?.profile?.username || displayName.toLowerCase().replace(/\\s+/g,'_')}</h1><span className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-slate-400">Student</span></div>
          <div className="mt-5 grid grid-cols-3 gap-2 text-center sm:max-w-lg sm:text-left">
            <div><strong className="text-lg sm:text-xl">{privatePosts.length}</strong><div className="text-xs text-slate-400">private posts</div></div>
            <div><strong className="text-lg sm:text-xl">{publicPosts.length}</strong><div className="text-xs text-slate-400">public posts</div></div>
            <div><strong className="text-lg sm:text-xl">{user?.profile?.connectionCount ?? user?.connectionCount ?? user?.profile?.connections?.length ?? 0}</strong><div className="text-xs text-slate-400">connected people</div></div>
          </div>
          <div className="mt-4 space-y-1 text-sm">
            <p className="font-semibold">{displayName}</p>
            {bio && <p className="whitespace-pre-wrap text-slate-300">{bio}</p>}
            <p className="text-slate-400">{[user?.profile?.iit, user?.profile?.branch, user?.profile?.batch].filter(Boolean).join(' · ')}</p>
            {user?.profile?.website && <a href={user.profile.website} target="_blank" rel="noreferrer" className="break-all font-semibold text-indigo-300 hover:underline">↗ {user.profile.website.replace('https://','').replace('http://','')}</a>}
          </div>
          <div className="mt-5 grid grid-cols-[1fr_1fr_44px] gap-2 sm:max-w-lg"><button type="button" onClick={()=>setEditing(true)} className="rounded-xl bg-[#30363b] px-4 py-2.5 text-sm font-semibold hover:bg-[#3b4248]">Edit profile</button><button type="button" onClick={shareProfile} className="rounded-xl bg-[#30363b] px-4 py-2.5 text-sm font-semibold hover:bg-[#3b4248]">Share profile</button><button type="button" onClick={()=>navigate('/app/search')} aria-label="Find people" className="flex items-center justify-center rounded-xl bg-[#30363b] text-lg hover:bg-[#3b4248]">♧</button></div>

        </div>
      </div>
    </section>
    <section className="py-6"><div className="flex gap-5 overflow-x-auto pb-2">
      {[
        {label:'Private posts',icon:'🔒',filter:'Private',count:privatePosts.length},
        {label:'Public posts',icon:'🌐',filter:'Public',count:publicPosts.length},
        {label:'Gallery',icon:'📷',filter:'Gallery',count:null},
        {label:'Events',icon:'🎟️',filter:'Events',count:null},
        {label:'Streak',icon:'🔥',filter:'All',count:Number(achievement?.points || 0),isStreak:true},
        {label:'More',icon:'•••',filter:'All',count:null}
      ].map(item=><button type="button" key={item.label} onClick={()=>setPostFilter(item.filter)} className="flex min-w-[68px] flex-col items-center gap-2 text-center"><span className="flex h-16 w-16 flex-col items-center justify-center rounded-full border border-white/15 bg-[#1b221d] text-xl sm:h-[74px] sm:w-[74px]">{item.icon}{item.isStreak&&<span className="mt-0.5 text-[10px] font-bold leading-none text-amber-200">{item.count.toLocaleString()}</span>}</span><span className="text-[11px] text-slate-300">{item.label}</span></button>)}
    </div></section>
    <section className="border-t border-white/[.08]">
      <div className="flex items-center justify-center gap-10 border-b border-white/[.08] py-4 text-xs font-semibold uppercase tracking-[.18em] text-slate-400"><button type="button" onClick={()=>setPostFilter('All')} className={postFilter==='All'?'border-b-2 border-white pb-4 -mb-4 text-white':'hover:text-white'}>▦ Posts</button><button type="button" onClick={()=>setPostFilter('Public')} className={postFilter==='Public'?'border-b-2 border-white pb-4 -mb-4 text-white':'hover:text-white'}>Public</button><button type="button" onClick={()=>setPostFilter('Private')} className={postFilter==='Private'?'border-b-2 border-white pb-4 -mb-4 text-white':'hover:text-white'}>Private</button></div>
      {postsLoading?<div className="py-16 text-center text-sm text-slate-500">Loading your posts…</div>:filteredPosts.length===0?<div className="py-16 text-center"><p className="text-lg font-semibold">No posts here yet</p><p className="mt-2 text-sm text-slate-500">Your shared photos and community posts will appear on your profile.</p></div>:<div className="grid grid-cols-3 gap-1.5 sm:gap-3">{filteredPosts.map((post,index)=><button type="button" key={post._id||index} onClick={()=>toast(post.caption||'Your post')} className="group relative aspect-square overflow-hidden bg-[#1a211c] text-left">{post.imageUrl?<img src={post.imageUrl} alt={post.caption||'Post'} className="h-full w-full object-cover transition group-hover:scale-105"/>:<div className="flex h-full items-center justify-center p-3 text-center text-sm text-slate-300">{post.caption}</div>}<span className="absolute left-2 top-2 rounded-md bg-black/65 px-2 py-1 text-[10px] text-white">{post.visibility==='private'?'🔒 Private':post.section||'Post'}</span></button>)}</div>}
    </section>
  </main>
}
