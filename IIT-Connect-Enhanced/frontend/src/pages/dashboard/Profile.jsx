import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import { IIT_LIST } from '../../utils/constants'
import { api } from '../../utils/api'
import { useAuth } from '../../hooks/useAuth'

export default function Profile() {
  const { user, refresh } = useAuth()
  const navigate = useNavigate()
  const isStudent = user?.role !== 'admin'

  const [name, setName] = useState('')
  const [iit, setIit] = useState(IIT_LIST[0])
  const [branch, setBranch] = useState('')
  const [batch, setBatch] = useState('')
  const [bio, setBio] = useState('')
  const [photo, setPhoto] = useState(null)
  const [photoPreview, setPhotoPreview] = useState('')
  const [busy, setBusy] = useState(false)

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
    setIit(user?.profile?.iit || IIT_LIST[0])
    setBranch(user?.profile?.branch || '')
    setBatch(user?.profile?.batch || '')
    setBio(user?.profile?.bio || '')
  }, [user?.id])

  const hasPhoto = Boolean(user?.profile?.photoUrl || photo)

  async function save(e) {
    e.preventDefault()

    if (isStudent && (!name.trim() || !iit.trim() || !branch.trim() || !batch.trim() || !hasPhoto)) {
      toast.error('Name, IIT, branch, batch and profile photo are required')
      return
    }

    setBusy(true)
    try {
      const fd = new FormData()
      fd.append('name', name.trim())
      fd.append('iit', iit)
      fd.append('branch', branch.trim())
      fd.append('batch', batch.trim())
      fd.append('bio', bio.trim())
      if (photo) fd.append('photo', photo)

      await api.put('/profile', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
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

  return (
    <form onSubmit={save} className="space-y-4">
      <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6">
        {isStudent && (
          <div className="mb-5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-4">
            <div className="font-semibold text-indigo-200">Complete your student profile</div>
            <p className="mt-1 text-sm text-slate-300">
              Add your name, institute, branch, batch and a profile photo to unlock the IIT Connect dashboard.
            </p>
            <p className="mt-2 text-xs text-slate-400">
              Your profile photo is mandatory. Bio is optional.
            </p>
          </div>
        )}

        <div className="flex items-start gap-4">
          <div className="h-20 w-20 rounded-2xl border border-slate-800 overflow-hidden bg-slate-900">
            {photoPreview ? (
              <img src={photoPreview} alt="Selected profile" className="h-full w-full object-cover" />
            ) : user?.profile?.photoUrl ? (
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
          <Input label="Name *" value={name} required={isStudent} maxLength={80} onChange={(e) => setName(e.target.value)} />
          <label className="block">
            <div className="text-sm text-slate-300 mb-1">IIT *</div>
            <select
              required={isStudent}
              className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2"
              value={iit}
              onChange={(e) => setIit(e.target.value)}
            >
              {IIT_LIST.map((x) => (
                <option key={x} value={x}>{x}</option>
              ))}
            </select>
          </label>
          <Input label="Branch *" value={branch} required={isStudent} maxLength={80} onChange={(e) => setBranch(e.target.value)} />
          <Input label="Batch *" value={batch} required={isStudent} maxLength={20} onChange={(e) => setBatch(e.target.value)} placeholder="2024-2028" />
        </div>

        <label className="block mt-3">
          <div className="text-sm text-slate-300 mb-1">Bio (optional)</div>
          <textarea
            maxLength={500}
            className="w-full min-h-[90px] rounded-xl bg-slate-950 border border-slate-800 px-3 py-2"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
        </label>

        <label className="block mt-3">
          <div className="text-sm text-slate-300 mb-1">Profile photo {isStudent ? '*' : '(optional)'}</div>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            required={isStudent && !user?.profile?.photoUrl}
            className="block w-full text-sm text-slate-300"
            onChange={(e) => setPhoto(e.target.files?.[0] || null)}
          />
          {isStudent && !user?.profile?.photoUrl && (
            <p className="mt-1 text-xs text-amber-300">Upload a photo to complete your profile.</p>
          )}
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
