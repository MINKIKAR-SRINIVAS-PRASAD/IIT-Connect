import React, { useRef, useState } from 'react'
import { X, Camera, ImagePlus, ShieldCheck, Globe, LockKeyhole, Send } from 'lucide-react'
import toast from 'react-hot-toast'
import { api } from '../../utils/api'

const destinations = ['News','Campus','Events','Community','Travel','Study','Placements','Gallery']

export default function MobileCreatePost({ onClose }) {
  const cameraRef = useRef(null), galleryRef = useRef(null)
  const [file,setFile] = useState(null), [caption,setCaption] = useState('')
  const [section,setSection] = useState('Community'), [visibility,setVisibility] = useState('public'), [busy,setBusy] = useState(false)
  const preview = file ? URL.createObjectURL(file) : ''
  async function publish(e) {
    e.preventDefault()
    if (!file) return toast.error('Capture a photo or choose one from your gallery')
    if (!caption.trim()) return toast.error('Add a caption before publishing')
    setBusy(true)
    try {
      const data = new FormData()
      data.append('media',file); data.append('caption',caption.trim())
      data.append('section',section); data.append('visibility',visibility)
      await api.post('/posts',data)
      toast.success(visibility==='private'?'Shared with your accepted connections':'Post published')
      onClose()
    } catch (error) { toast.error(error?.response?.data?.message || 'Could not publish your post') }
    finally { setBusy(false) }
  }
  return <div className="fixed inset-0 z-[100] flex flex-col bg-[#080b15] text-white" role="dialog" aria-modal="true" aria-label="Create post">
    <header className="flex items-center justify-between border-b border-white/10 px-4 py-3" style={{paddingTop:'max(12px,env(safe-area-inset-top))'}}>
      <button type="button" onClick={onClose} className="rounded-full p-2 text-slate-300" aria-label="Close create post"><X/></button>
      <span className="text-sm font-semibold">Create a post</span>
      <button form="mobile-create-post" type="submit" disabled={busy||!file||!caption.trim()} className="rounded-xl bg-indigo-400 px-4 py-2 text-xs font-bold text-[#101322] disabled:opacity-40">{busy?'Publishing…':'Publish'}</button>
    </header>
    <form id="mobile-create-post" onSubmit={publish} className="flex-1 space-y-4 overflow-y-auto p-4" style={{paddingBottom:'max(20px,env(safe-area-inset-bottom))'}}>
      <div className="grid grid-cols-2 gap-3">
        <button type="button" onClick={()=>cameraRef.current?.click()} className="flex items-center justify-center gap-2 rounded-2xl border border-indigo-300/20 bg-indigo-400/10 py-4 text-sm font-semibold"><Camera size={19}/> Take photo</button>
        <button type="button" onClick={()=>galleryRef.current?.click()} className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[.04] py-4 text-sm font-semibold"><ImagePlus size={19}/> Gallery</button>
      </div>
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={e=>setFile(e.target.files?.[0]||null)}/>
      <input ref={galleryRef} type="file" accept="image/*" className="hidden" onChange={e=>setFile(e.target.files?.[0]||null)}/>
      {preview ? <div className="relative overflow-hidden rounded-2xl border border-white/10"><img src={preview} alt="Selected post media preview" className="max-h-[42vh] w-full object-contain"/><button type="button" onClick={()=>setFile(null)} className="absolute right-3 top-3 rounded-full bg-black/70 p-2" aria-label="Remove selected media"><X size={16}/></button></div> : <div className="flex min-h-44 items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/[.02] text-center text-sm text-slate-500">Your photo preview appears here</div>}
      <label className="block"><span className="mb-2 block text-xs font-semibold text-slate-300">Publish to</span><select value={section} onChange={e=>setSection(e.target.value)} className="w-full rounded-xl border border-white/10 bg-[#111626] px-3 py-3 text-sm text-white">{destinations.map(x=><option key={x}>{x}</option>)}</select></label>
      <label className="block"><span className="mb-2 block text-xs font-semibold text-slate-300">Caption</span><textarea value={caption} onChange={e=>setCaption(e.target.value)} maxLength={2000} rows={3} placeholder="Write something about this moment…" className="w-full resize-none rounded-xl border border-white/10 bg-[#111626] px-3 py-3 text-sm text-white placeholder:text-slate-500"/></label>
      <fieldset><legend className="mb-2 text-xs font-semibold text-slate-300">Who can see this?</legend><div className="grid grid-cols-2 gap-3">
        <button type="button" onClick={()=>setVisibility('public')} className={'rounded-xl border p-3 text-left '+(visibility==='public'?'border-indigo-300/40 bg-indigo-400/10':'border-white/10 bg-white/[.02]')}><Globe size={17}/><span className="mt-2 block text-sm font-semibold">Public</span><span className="mt-1 block text-[10px] text-slate-400">Everyone in the network</span></button>
        <button type="button" onClick={()=>setVisibility('private')} className={'rounded-xl border p-3 text-left '+(visibility==='private'?'border-indigo-300/40 bg-indigo-400/10':'border-white/10 bg-white/[.02]')}><LockKeyhole size={17}/><span className="mt-2 block text-sm font-semibold">Private</span><span className="mt-1 block text-[10px] text-slate-400">Accepted connections only</span></button>
      </div></fieldset>
      {visibility==='private'&&<p className="flex items-start gap-2 rounded-xl border border-emerald-300/15 bg-emerald-300/[.04] p-3 text-xs leading-5 text-emerald-100/80"><ShieldCheck size={16} className="mt-0.5 shrink-0"/> The backend checks accepted connections before returning private posts.</p>}
      <button type="submit" disabled={busy||!file||!caption.trim()} className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-400 py-3.5 text-sm font-bold text-[#101322] disabled:opacity-40"><Send size={16}/>{busy?'Publishing…':'Publish post'}</button>
    </form>
  </div>
}
