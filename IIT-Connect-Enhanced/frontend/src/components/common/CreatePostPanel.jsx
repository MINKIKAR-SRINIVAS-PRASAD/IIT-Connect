import React,{useState} from 'react'
import {PenLine,Sparkles} from 'lucide-react'
export default function CreatePostPanel({eyebrow='COMMUNITY CONTRIBUTION',title,description,buttonLabel='Create post',children,open:controlledOpen,onToggle}){
 const [internalOpen,setInternalOpen]=useState(false)
 const controlled=controlledOpen!==undefined
 const open=controlled?controlledOpen:internalOpen
 const toggle=()=>controlled?onToggle?.():setInternalOpen(v=>!v)
 return <div className="space-y-4">
  <section className="page-hero relative overflow-hidden rounded-3xl border border-[#a8c49a]/20 bg-[radial-gradient(ellipse_at_85%_5%,rgba(115,145,105,.22),transparent_38%),linear-gradient(120deg,#1b2820,#26382c_58%,#1b2a23)] p-5 md:p-6">
   <div className="relative z-10 flex flex-wrap items-center justify-between gap-4"><div><div className="inline-flex items-center gap-2 rounded-full border border-[#a8c49a]/20 bg-[#a8c49a]/10 px-3 py-1.5 text-[10px] font-bold tracking-[.16em] text-[#b6d0a8]"><Sparkles size={13}/>{eyebrow}</div><h2 className="mt-3 text-xl font-bold text-[#f0f1e8]">{title}</h2><p className="mt-1 text-sm text-[#c1cbbd]">{description}</p></div><button type="button" onClick={toggle} className="inline-flex items-center gap-2 rounded-xl bg-[#a8c49a] px-4 py-3 text-xs font-bold text-[#152016] hover:bg-[#c0d5b4]"><PenLine size={15}/>{open?'Close form':buttonLabel}</button></div>
  </section>
  {open&&children&&<div className="rounded-2xl border border-[#a8c49a]/20 bg-[#172219] p-4 md:p-5">{children}</div>}
 </div>
}
