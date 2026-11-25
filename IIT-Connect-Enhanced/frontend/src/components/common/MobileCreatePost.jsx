import React, { useEffect, useRef, useState } from 'react'
import { ArrowLeft, Camera, Check, ImagePlus, LoaderCircle, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { api } from '../../utils/api'

const destinations = ['News', 'Campus', 'Events', 'Community', 'Travel', 'Study', 'Placements', 'Gallery']

export default function MobileCreatePost({ onClose, onCreated }) {
  const [caption, setCaption] = useState('')
  const [section, setSection] = useState('Community')
  const [visibility, setVisibility] = useState('public')
  const [file, setFile] = useState(null)
  const [busy, setBusy] = useState(false)
  const [preview, setPreview] = useState('')
  const cameraInput = useRef(null)
  const galleryInput = useRef(null)

  useEffect(() => {
    if (!file) { setPreview(''); return }
    const url = URL.createObjectURL(file)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  useEffect(() => {
    const onKeyDown = (event) => { if (event.key === 'Escape' && !busy) onClose?.() }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose, busy])

  async function submit(event) {
    event.preventDefault()
    if (!file) return toast.error('Capture a photo or choose one from your gallery')
    if (!caption.trim()) return toast.error('Add a caption before sharing')
    setBusy(true)
    try {
      const body = new FormData()
      body.append('media', file)
      body.append('caption', caption.trim())
      body.append('section', section)
      body.append('visibility', visibility)
      await api.post('/posts', body)
      toast.success('Your post has been shared')
      onCreated?.()
      onClose?.()
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Could not publish your post')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[150] flex h-[100dvh] flex-col bg-[#080b0a] text-[#edf1e8]" role="dialog" aria-modal="true" aria-label="Create a post">
      <header className="flex shrink-0 items-center justify-between border-b border-white/10 px-4 py-3 pt-[max(12px,env(safe-area-inset-top))]">
        <button type="button" onClick={onClose} disabled={busy} aria-label="Back" className="rounded-full p-2 text-slate-300 hover:bg-white/10"><ArrowLeft size={22}/></button>
        <div className="text-center"><h1 className="text-base font-semibold">Create post</h1><p className="text-[11px] text-slate-500">Capture a moment. Share it with your campus.</p></div>
        <button type="submit" form="swipe-create-post" disabled={busy || !file || !caption.trim()} className="inline-flex items-center gap-1 rounded-full bg-[#a8c49a] px-4 py-2 text-sm font-bold text-[#142016] disabled:opacity-40">{busy ? <LoaderCircle size={16} className="animate-spin"/> : <Check size={16}/>} Share</button>
      </header>

      <form id="swipe-create-post" onSubmit={submit} className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        <section className="flex min-h-[34vh] flex-1 items-center justify-center p-4">
          {preview ? <div className="relative max-h-full w-full max-w-xl overflow-hidden rounded-2xl border border-white/10 bg-black">
            <img src={preview} alt="Selected post preview" className="mx-auto max-h-[48vh] w-full object-contain"/>
            <button type="button" onClick={() => setFile(null)} aria-label="Remove selected photo" className="absolute right-3 top-3 rounded-full bg-black/70 p-2"><X size={18}/></button>
          </div> : <div className="flex w-full max-w-sm flex-col items-center gap-4 text-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-3xl border border-[#a8c49a]/20 bg-[#a8c49a]/[.07] text-[#b9d1ac]"><Camera size={42}/></div>
            <div><h2 className="text-lg font-semibold">Your camera, your moment</h2><p className="mt-1 text-sm text-slate-500">Take a campus photo or select one to begin.</p></div>
            <div className="flex flex-wrap justify-center gap-3">
              <button type="button" onClick={() => cameraInput.current?.click()} className="inline-flex items-center gap-2 rounded-xl bg-[#a8c49a] px-5 py-3 text-sm font-semibold text-[#152016]"><Camera size={17}/> Open camera</button>
              <button type="button" onClick={() => galleryInput.current?.click()} className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-5 py-3 text-sm font-semibold text-white"><ImagePlus size={17}/> Choose photo</button>
            </div>
          </div>}
          <input ref={cameraInput} type="file" accept="image/*" capture="environment" className="hidden" onChange={e => setFile(e.target.files?.[0] || null)}/>
          <input ref={galleryInput} type="file" accept="image/*" className="hidden" onChange={e => setFile(e.target.files?.[0] || null)}/>
        </section>

        <section className="shrink-0 space-y-5 border-t border-white/10 bg-[#101612] px-4 pb-[max(18px,env(safe-area-inset-bottom))] pt-5 sm:px-6">
          <label className="block"><span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">Caption</span><textarea value={caption} onChange={e => setCaption(e.target.value)} maxLength={2000} rows={2} placeholder="Write something about this moment…" className="w-full resize-none rounded-xl border border-white/10 bg-[#080d09] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-[#a8c49a]/50"/></label>
          <div><div className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Where do you want to share?</div><div className="flex flex-wrap gap-2">{destinations.map(name => <button key={name} type="button" onClick={() => setSection(name)} className={'rounded-full border px-3.5 py-2 text-xs font-semibold transition '+(section===name?'border-[#a8c49a]/50 bg-[#a8c49a]/15 text-[#c6dfb8]':'border-white/10 bg-white/[.025] text-slate-400 hover:text-white')}>{section===name?'✓ ':''}{name}</button>)}</div></div>
          <div className="flex items-center justify-between gap-3"><span className="text-xs text-slate-500">Post visibility</span><div className="flex rounded-full border border-white/10 p-1"><button type="button" onClick={() => setVisibility('public')} className={'rounded-full px-3 py-1.5 text-xs '+(visibility==='public'?'bg-[#a8c49a]/15 text-[#c6dfb8]':'text-slate-500')}>Public</button><button type="button" onClick={() => setVisibility('private')} className={'rounded-full px-3 py-1.5 text-xs '+(visibility==='private'?'bg-[#a8c49a]/15 text-[#c6dfb8]':'text-slate-500')}>Private</button></div></div>
          <button type="submit" disabled={busy || !file || !caption.trim()} className="w-full rounded-xl bg-[#a8c49a] px-5 py-3.5 text-sm font-bold text-[#142016] disabled:cursor-not-allowed disabled:opacity-40">{busy?'Sharing post…':`Share to ${section}`}</button>
        </section>
      </form>
    </div>
  )
}
