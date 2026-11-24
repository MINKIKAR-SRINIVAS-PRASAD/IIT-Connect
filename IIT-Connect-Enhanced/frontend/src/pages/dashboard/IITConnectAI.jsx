import React, { useState } from 'react'
import { api } from '../../utils/api'
import { useAuth } from '../../hooks/useAuth'
import { Bot, Send, Sparkles, UserRound, Trash2, LoaderCircle } from 'lucide-react'

const prompts = [
  'Explain a difficult engineering concept simply',
  'Create a 7-day exam revision plan',
  'Help me debug or understand my code',
  'Make practice questions with answers'
]

export default function IITConnectAI() {
  const { user } = useAuth()
  const isFaculty = user?.role === 'faculty'
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)

  async function send(value = text) {
    const message = value.trim()
    if (!message || busy) return
    const history = messages.slice(-12).map(({ role, content }) => ({ role, content }))
    setMessages(prev => [...prev, { role: 'user', content: message }])
    setText('')
    setBusy(true)
    try {
      const { data } = await api.post('/ai/chat', { message, history })
      setMessages(prev => [...prev, { role: 'assistant', content: data.answer }])
    } catch (error) {
      const detail = error?.response?.data?.message || 'I could not respond just now. Please try again.'
      setMessages(prev => [...prev, { role: 'assistant', content: detail, error: true }])
    } finally {
      setBusy(false)
    }
  }

  return <div className="mx-auto flex min-h-[72vh] max-w-5xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#101a18]">
    <header className="flex items-center gap-3 border-b border-white/10 bg-white/[.025] p-5">
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#a8c49a]/15 text-[#b9d5aa]"><Bot size={23}/></span>
      <div className="min-w-0 flex-1"><h1 className="text-xl font-semibold text-slate-100">IIT Connect AI</h1><p className="mt-1 text-xs text-slate-400">{isFaculty ? 'Academic, research and teaching assistant' : 'Your learning, coding and campus assistant'}</p></div>
      <button type="button" onClick={() => setMessages([])} disabled={!messages.length || busy} title="Clear conversation" className="rounded-xl border border-white/10 p-2.5 text-slate-400 hover:text-white disabled:opacity-40"><Trash2 size={16}/></button>
    </header>
    <main className="flex-1 space-y-5 p-4 sm:p-6">
      {!messages.length ? <div className="mx-auto max-w-2xl py-10 text-center"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-[#a8c49a]/10 text-[#b9d5aa]"><Sparkles size={30}/></div><h2 className="mt-5 text-2xl font-semibold text-white">What can I help you with?</h2><p className="mt-2 text-sm text-slate-400">Ask questions, learn concepts, plan study sessions or work through research and coding problems.</p><div className="mt-7 grid gap-2 text-left sm:grid-cols-2">{prompts.map(p=><button key={p} onClick={()=>send(p)} className="rounded-2xl border border-white/10 bg-white/[.025] p-4 text-sm text-slate-300 transition hover:border-[#a8c49a]/35 hover:bg-[#a8c49a]/[.06]">{p}</button>)}</div></div> : messages.map((m,i)=><div key={i} className={m.role==='user'?'flex gap-3 justify-end':'flex gap-3'}>{m.role==='assistant'&&<span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#a8c49a]/10 text-[#b9d5aa]"><Bot size={16}/></span>}<div className={m.role==='user'?'max-w-[88%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-7 sm:max-w-[78%] bg-[#a8c49a] text-[#101810]':'max-w-[88%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-7 sm:max-w-[78%] border border-white/10 bg-white/[.04] text-slate-200'}>{m.content}</div>{m.role==='user'&&<span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/10 text-slate-300"><UserRound size={16}/></span>}</div>)}
      {busy&&<div className="flex items-center gap-2 text-xs text-slate-400"><LoaderCircle size={15} className="animate-spin"/> IIT Connect AI is thinking…</div>}
    </main>
    <form onSubmit={e=>{e.preventDefault();send()}} className="border-t border-white/10 bg-black/10 p-4 sm:p-5"><div className="flex items-end gap-2 rounded-2xl border border-white/10 bg-[#0b1411] p-2 focus-within:border-[#a8c49a]/40"><textarea value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send()}}} rows={2} maxLength={6000} placeholder="Ask IIT Connect AI anything…" className="max-h-40 min-h-[48px] flex-1 resize-y bg-transparent px-2 py-2 text-sm text-white outline-none placeholder:text-slate-500"/><button type="submit" disabled={!text.trim()||busy} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#a8c49a] text-[#101810] transition hover:bg-[#bdd5ae] disabled:opacity-40"><Send size={18}/></button></div><p className="mt-2 text-center text-[10px] text-slate-500">AI can make mistakes. Verify important academic or official information.</p></form>
  </div>
}