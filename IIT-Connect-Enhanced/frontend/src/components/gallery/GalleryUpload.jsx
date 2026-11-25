import React, { useState } from 'react'
import toast from 'react-hot-toast'
import Button from '../common/Button'
import Input from '../common/Input'
import { api } from '../../utils/api'

export default function GalleryUpload({ onCreated }) {
  const [caption, setCaption] = useState('')
  const [file, setFile] = useState(null)
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    if (!file) return toast.error('Select an image')
    setBusy(true)
    try {
      const fd = new FormData()
      fd.append('caption', caption)
      fd.append('image', file)
      // Let the browser set multipart/form-data with its generated boundary.
      const { data } = await api.post('/gallery', fd)
      toast.success('Uploaded (Pending approval)')
      setCaption('')
      setFile(null)
      onCreated?.(data.post)
    } catch (e2) {
      toast.error(e2?.response?.data?.message || 'Upload failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
      <div className="font-semibold">Upload to Gallery</div>
      <div className="mt-3 grid md:grid-cols-2 gap-3">
        <Input label="Caption" value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="A moment at campus..." />
        <label className="block">
          <div className="text-sm text-slate-300 mb-1">Image</div>
          <input
            type="file"
            accept="image/*"
            className="block w-full text-sm text-slate-300"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </label>
      </div>
      <div className="mt-3">
        <Button disabled={busy}>{busy ? 'Uploading...' : 'Upload (Pending)'}</Button>
      </div>
    </form>
  )
}
