import React from 'react'
import { X, Camera } from 'lucide-react'
import GalleryUpload from '../gallery/GalleryUpload.jsx'

/** Mobile swipe-to-create composer. Reuses the existing approved gallery upload flow. */
export default function MobileCreatePost({ onClose }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/75 p-0 backdrop-blur-sm sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label="Create campus post">
      <div className="max-h-[92dvh] w-full max-w-xl overflow-y-auto rounded-t-3xl border border-white/10 bg-[#101522] p-4 shadow-2xl sm:rounded-3xl sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-400/15 text-indigo-200"><Camera size={19}/></span>
            <div><h2 className="text-lg font-semibold text-white">Create a campus post</h2><p className="text-xs text-slate-400">Choose a photo and share a moment</p></div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close composer" className="rounded-full border border-white/10 p-2 text-slate-300 hover:bg-white/10"><X size={18}/></button>
        </div>
        <GalleryUpload onCreated={onClose} />
      </div>
    </div>
  )
}
