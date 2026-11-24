import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import { api } from '../../utils/api'
import { useAuth } from '../../hooks/useAuth'

export default function Profile() {
  const { user, refresh } = useAuth()

  const [name, setName] = useState('')
  const [rollNumber, setRollNumber] = useState('')
  const [branch, setBranch] = useState('')
  const [batch, setBatch] = useState('')
  const [bio, setBio] = useState('')
  const [photo, setPhoto] = useState(null)
  const [busy, setBusy] = useState(false)
  const [achievement, setAchievement] = useState(null)
  const [certificateBusy, setCertificateBusy] = useState(false)

  const navigate = useNavigate()

const profileComplete = (profile) => {
  return Boolean(
    profile?.name?.trim() &&
    profile?.iit?.trim() &&
    profile?.branch?.trim() &&
    profile?.batch?.trim()
  )
}

  useEffect(() => {
    setName(user?.profile?.name || '')
    setRollNumber(user?.profile?.rollNumber || '')
    setBranch(user?.profile?.branch || '')
    setBatch(user?.profile?.batch || '')
    setBio(user?.profile?.bio || '')
  }, [user])

  useEffect(() => {
    if (!user?._id && !user?.id) return
    api.get('/profile/achievements').then(({ data }) => setAchievement(data)).catch(() => {})
  }, [user?._id, user?.id])

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
      URL.revokeObjectURL(link.href)
      setAchievement((old) => old ? { ...old, certificateId: cert.certificateId } : old)
      toast.success('Certificate generated. Open the downloaded file and print or save as PDF.')
    } catch (error) { toast.error(error?.response?.data?.message || 'Unable to issue certificate') }
    finally { setCertificateBusy(false) }
  }

  async function save(e) {
    e.preventDefault()
    setBusy(true)
    try {
      const fd = new FormData()
      fd.append('name', name)
      fd.append('rollNumber', rollNumber)
      fd.append('branch', branch)
      fd.append('batch', batch)
      fd.append('bio', bio)
      if (photo) fd.append('photo', photo)

      await api.put('/profile', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      toast.success('Profile updated')
      await refresh()
      setPhoto(null)
    } catch (e2) {
      toast.error(e2?.response?.data?.message || 'Failed to update profile')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={save} className="space-y-4">
      <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6">
        <div className="flex items-start gap-4">
          <div className="h-20 w-20 rounded-2xl border border-slate-800 overflow-hidden bg-slate-900">
            {user?.profile?.photoUrl ? (
              <img src={user.profile.photoUrl} alt="profile" className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-slate-400 text-sm">No Photo</div>
            )}
          </div>
          <div className="flex-1">
            <div className="text-xl font-semibold">Your Profile</div>
            <div className="text-sm text-slate-300">{user?.email}</div>
          </div>
        </div>

        <div className="mt-5 grid md:grid-cols-2 gap-3">
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <label className="block">
            <div className="text-sm text-slate-300 mb-1">College / institute (verified)</div>
            <input
              value={user?.profile?.iit || 'Will be detected from your IIT email'}
              readOnly
              aria-readonly="true"
              className="w-full rounded-xl bg-slate-950/70 border border-slate-800 px-3 py-2 text-slate-300 cursor-not-allowed"
            />
            <p className="mt-1 text-xs text-slate-500">Automatically set from your IIT email and cannot be edited.</p>
          </label>
          <Input label="Roll number" value={rollNumber} onChange={(e) => setRollNumber(e.target.value)} placeholder="e.g. 24ME01058" />
          <Input label="Branch" value={branch} onChange={(e) => setBranch(e.target.value)} />
          <Input label="Batch" value={batch} onChange={(e) => setBatch(e.target.value)} placeholder="2021" />
        </div>

        <label className="block mt-3">
          <div className="text-sm text-slate-300 mb-1">Bio</div>
          <textarea
            className="w-full min-h-[90px] rounded-xl bg-slate-950 border border-slate-800 px-3 py-2"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
        </label>

        <label className="block mt-3">
          <div className="text-sm text-slate-300 mb-1">Profile photo</div>
          <input type="file" accept="image/*" className="block w-full text-sm text-slate-300" onChange={(e) => setPhoto(e.target.files?.[0] || null)} />
        </label>

        <div className="mt-4">
          <Button disabled={busy}>{busy ? 'Saving...' : 'Save profile'}</Button>
        </div>
      </div>

      <section className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/20 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs uppercase tracking-[0.2em] text-amber-300">Contribution achievements</p><h2 className="mt-1 text-xl font-bold text-white">Post Streak</h2><p className="mt-1 text-sm text-slate-400">Only approved posts count. Chat messages and DMs earn no points.</p></div><span className="rounded-full border border-amber-400/40 bg-amber-400/10 px-4 py-2 text-sm font-semibold text-amber-200">{achievement?.level || "Starter"}</span></div>
        <div className="mt-5 flex items-end justify-between gap-4"><div><p className="text-3xl font-black text-white">{Number(achievement?.points || 0).toLocaleString()}</p><p className="text-xs text-slate-400">contribution points</p></div><p className="text-sm text-slate-400">{achievement?.nextMilestone ? `${Number(achievement.pointsToNext).toLocaleString()} to next badge` : "All badge milestones reached"}</p></div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800"><div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-200" style={{ width: achievement?.nextMilestone ? `${Math.min(100, (achievement.points / achievement.nextMilestone) * 100)}%` : "100%" }} /></div>
        <div className="mt-4 grid gap-2 text-sm text-slate-300 sm:grid-cols-3"><span>🥈 Silver · 1,000</span><span>🥇 Gold · 5,000</span><span>💎 Platinum · 10,000</span></div>
        {achievement?.rewards?.length > 0 && <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-slate-400">{achievement.rewards.map((reward) => <li key={reward}>{reward}</li>)}</ul>}
        {achievement?.certificateAvailable && <button type="button" onClick={downloadCertificate} disabled={certificateBusy} className="mt-5 rounded-xl bg-amber-400 px-4 py-3 font-bold text-slate-950 disabled:opacity-60">{certificateBusy ? "Preparing certificate…" : achievement.certificateId ? "Download Platinum certificate" : "Generate Platinum certificate"}</button>}
      </section>
      <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6">
        <div className="text-sm text-slate-300">
          Note: If any issue contact mail: srinivasminki@gmail.com
        </div>
      </div>
    </form>
  )
}
