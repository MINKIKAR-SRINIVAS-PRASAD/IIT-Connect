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

      <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6">
        <div className="text-sm text-slate-300">
          Note: If any issue contact mail: srinivasminki@gmail.com
        </div>
      </div>
    </form>
  )
}
