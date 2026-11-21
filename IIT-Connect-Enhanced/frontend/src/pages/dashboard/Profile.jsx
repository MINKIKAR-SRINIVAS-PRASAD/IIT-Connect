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
  const isStudent = user?.role !== 'admin'

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
  }, [user?.id])

  async function changePassword(e) {
    e.preventDefault()
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
          <Input label="Roll number" value={rollNumber} maxLength={40} onChange={(e) => setRollNumber(e.target.value.toUpperCase())} placeholder="xxxxxx" />
          <div className="block">\n            <Input label={isStudent ? "College / institute (verified)" : "College / institute *"} value={isStudent ? (user?.profile?.iit || iit) : iit} required={isStudent} maxLength={120} readOnly={isStudent} onChange={isStudent ? undefined : (e) => setIit(e.target.value)} placeholder={isStudent ? "Detected from your verified institute email" : "Enter your college or institute"} className={isStudent ? "cursor-not-allowed opacity-80" : ""} />\n            {isStudent && <p className="mt-1 text-xs text-slate-400">Automatically set from your verified IIT email address. Students cannot edit this field.</p>}\n          </div>
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

      <section className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6">
        <h2 className="text-lg font-semibold">Change password</h2>
        <p className="mt-1 text-sm text-slate-400">Use your current password to set a new one.</p>
        <form onSubmit={changePassword} className="mt-4 grid gap-3 md:grid-cols-3">
          <Input label="Current password" type="password" autoComplete="current-password" value={currentPassword} required onChange={e=>setCurrentPassword(e.target.value)} />
          <Input label="New password (8+ characters)" type="password" autoComplete="new-password" value={newPassword} minLength={8} required onChange={e=>setNewPassword(e.target.value)} />
          <Input label="Confirm new password" type="password" autoComplete="new-password" value={confirmPassword} minLength={8} required onChange={e=>setConfirmPassword(e.target.value)} />
          <div className="md:col-span-3"><Button disabled={passwordBusy}>{passwordBusy ? 'Updating password…' : 'Change password'}</Button></div>
        </form>
      </section>

      <NotificationSettings />

      <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6">
        <div className="text-sm text-slate-300">
          Note: If any issue contact mail: iitconnectindia@gmail.com
        </div>
      </div>
    </form>
  )
}
