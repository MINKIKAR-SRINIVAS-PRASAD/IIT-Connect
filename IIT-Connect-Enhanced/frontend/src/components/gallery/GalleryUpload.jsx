import React, { useRef, useState } from 'react'
import toast from 'react-hot-toast'
import Button from '../common/Button'
import Input from '../common/Input'
import { api } from '../../utils/api'

export default function GalleryUpload({ onCreated }) {
  const [caption, setCaption] = useState('')
  const [file, setFile] = useState(null)
  const [busy, setBusy] = useState(false)
  const fileInput = useRef(null)

  async function submit(e) {
    e.preventDefault()
    if (!caption.trim()) return toast.error('Enter a photo caption')
    if (!file) return toast.error('Choose an image file')
    setBusy(true)
    try {
      const fd = new FormData()
      fd.append('caption', caption.trim())
      fd.append('image', file)
      // Let the browser add the multipart boundary automatically.
      const { data } = await api.post('/gallery', fd)
      toast.success('Photo submitted for admin approval')
      setCaption('')
      setFile(null)
      if (fileInput.current) fileInput.current.value = ''
      onCreated?.(data.post)
    } catch (e2) {
      toast.error(e2?.response?.data?.message || 'Upload failed')
    } finally {
      setBusy(false)
    }
  }

  function clearForm() {
    setCaption('')
    setFile(null)
    if (fileInput.current) fileInput.current.value = ''
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-[#a8c49a]/20 bg-[#17232d] p-4 md:p-5">
      <h3 className="text-base font-semibold text-[#edf1e8]">Upload to Gallery</h3>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div>
          <Input
            label={<span>Caption <span className="text-rose-400">*</span></span>}
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="A moment at campus..."
            required
          />
        </div>
        <label className="block min-w-0">
          <span className="mb-2 block text-sm font-medium text-[#c8d0c6]">Image <span className="text-rose-400">*</span></span>
          <input
            ref={fileInput}
            type="file"
            accept="image/*"
            required
            className="block min-h-[52px] w-full rounded-xl border border-[#a8c49a]/15 bg-[#101813] p-3 text-sm text-[#dce4d8] file:mr-3 file:rounded-lg file:border-0 file:bg-[#a8c49a] file:px-3 file:py-2 file:font-semibold file:text-[#152016] hover:file:bg-[#c0d5b4]"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </label>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/10 pt-4">
        <Button disabled={busy || !caption.trim() || !file}>{busy ? 'Uploading...' : 'Submit for admin approval'}</Button>
        <button
          type="button"
          onClick={clearForm}
          disabled={busy}
          className="rounded-xl border border-[#a8c49a]/20 px-4 py-3 text-sm font-medium text-[#cbd3c7] transition hover:bg-white/5 disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
