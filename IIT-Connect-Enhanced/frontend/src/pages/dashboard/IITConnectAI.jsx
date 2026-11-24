import React, { useCallback, useEffect, useRef, useState } from 'react'
import { api } from '../../utils/api'
import { useAuth } from '../../hooks/useAuth'
import {
  Bot, Send, Sparkles, UserRound, Trash2, LoaderCircle, Plus,
  MessageSquare, Pencil, PanelLeftClose, PanelLeftOpen, Search, MoreHorizontal, Paperclip, X, FileText, FolderUp
} from 'lucide-react'

const prompts = [
  'Explain a difficult engineering concept simply',
  'Create a 7-day exam revision plan',
  'Help me debug or understand my code',
  'Make practice questions with answers'
]

const formatDate = value => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const now = new Date()
  const sameDay = date.toDateString() === now.toDateString()
  return sameDay ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : date.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

export default function IITConnectAI() {
  const { user } = useAuth()
  const isFaculty = user?.role === 'faculty'
  const [conversations, setConversations] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [attachments, setAttachments] = useState([])
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)
  const folderInputRef = useRef(null)
  const [busy, setBusy] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [historyOpen, setHistoryOpen] = useState(() => typeof window !== 'undefined' && window.innerWidth >= 640)
  const [search, setSearch] = useState('')
  const messagesRef = useRef(null)

  const loadConversations = useCallback(async () => {
    const { data } = await api.get('/ai/conversations')
    const items = data.conversations || []
    setConversations(items)
    return items
  }, [])

  const openConversation = useCallback(async id => {
    if (!id) {
      setActiveId(null)
      setMessages([])
      return
    }
    setActiveId(id)
    setMessages([])
    try {
      const { data } = await api.get(`/ai/conversations/${id}`)
      setMessages(data.conversation?.messages || [])
    } catch (error) {
      setMessages([{ role: 'assistant', content: error?.response?.data?.message || 'Could not load this conversation.' }])
    }
  }, [])

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const { data } = await api.get('/ai/conversations')
        if (!alive) return
        const items = data.conversations || []
        setConversations(items)
        if (items.length) {
          setActiveId(items[0].id)
          const detail = await api.get(`/ai/conversations/${items[0].id}`)
          if (alive) setMessages(detail.data.conversation?.messages || [])
        }
      } catch {
        // An empty history is a valid first-use state. Errors surface when sending.
      } finally {
        if (alive) setLoadingHistory(false)
      }
    })()
    return () => { alive = false }
  }, [])

  useEffect(() => {
    const container = messagesRef.current
    if (container) container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' })
  }, [messages, busy])

  async function newChat() {
    if (busy) return
    setActiveId(null)
    setMessages([])
    setText('')
  }

  async function renameConversation(conversation) {
    const title = window.prompt('Rename conversation', conversation.title || 'New chat')
    if (title == null || !title.trim()) return
    try {
      await api.patch(`/ai/conversations/${conversation.id}`, { title: title.trim() })
      await loadConversations()
    } catch (error) {
      window.alert(error?.response?.data?.message || 'Could not rename conversation.')
    }
  }

  async function deleteConversation(conversation) {
    if (!window.confirm(`Delete “${conversation.title}”? This cannot be undone.`)) return
    try {
      await api.delete(`/ai/conversations/${conversation.id}`)
      const items = await loadConversations()
      if (activeId === conversation.id) {
        if (items.length) await openConversation(items[0].id)
        else await newChat()
      }
    } catch (error) {
      window.alert(error?.response?.data?.message || 'Could not delete conversation.')
    }
  }

  async function send(value = text) {
    const message = value.trim()
    if ((!message && !attachments.length) || busy || uploading) return
    const tempId = `local-${Date.now()}`
    const pendingAttachments = [...attachments]
    setMessages(prev => [...prev, { id: tempId, role: 'user', content: message || 'Please analyze these attachments.', attachments: pendingAttachments }])
    setText('')
    setAttachments([])
    setBusy(true)
    try {
      const { data } = await api.post('/ai/chat', { message: message || 'Please analyze these attachments.', conversationId: activeId, attachments: pendingAttachments })
      if (data.conversationId && data.conversationId !== activeId) setActiveId(data.conversationId)
      setMessages(prev => [...prev, { role: 'assistant', content: data.answer }])
      await loadConversations()
    } catch (error) {
      const detail = error?.response?.data?.message || 'I could not respond just now. Please try again.'
      if (error?.response?.data?.conversationId) setActiveId(error.response.data.conversationId)
      setMessages(prev => [...prev, { role: 'assistant', content: detail, error: true }])
      try { await loadConversations() } catch {}
    } finally {
      setBusy(false)
    }
  }

  async function selectFiles(event) {
    const files = Array.from(event.target.files || [])
    event.target.value = ''
    if (!files.length) return
    if (files.length + attachments.length > 10) { window.alert('You can attach up to 10 files per message.'); return }
    setUploading(true)
    try {
      const form = new FormData()
      files.forEach(file => form.append('files', file))
      const { data } = await api.post('/ai/upload', form)
      setAttachments(prev => [...prev, ...(data.files || [])])
    } catch (error) { window.alert(error?.response?.data?.message || 'Could not upload files. Please try again.') }
    finally { setUploading(false) }
  }

  const visibleConversations = conversations.filter(item =>
    (item.title || '').toLowerCase().includes(search.toLowerCase()) ||
    (item.preview || '').toLowerCase().includes(search.toLowerCase())
  )

  return <div className="relative mx-auto flex h-[calc(100dvh-9rem)] min-h-[26rem] max-h-[900px] w-full max-w-6xl overflow-hidden rounded-2xl border border-white/10 bg-[#101a18] sm:h-[72vh] sm:min-h-[30rem] sm:rounded-3xl">
    {historyOpen && <><button type="button" aria-label="Close chat history" onClick={() => setHistoryOpen(false)} className="absolute inset-0 z-10 bg-black/55 sm:hidden"/><aside className="absolute inset-y-0 left-0 z-20 flex h-full min-h-0 w-[min(82vw,300px)] shrink-0 flex-col border-r border-white/10 bg-[#0b1411] shadow-2xl sm:relative sm:z-auto sm:w-[250px] sm:shadow-none md:w-[270px]">
      <div className="flex items-center gap-2 border-b border-white/10 p-3">
        <button type="button" onClick={newChat} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#a8c49a] px-3 py-2.5 text-sm font-semibold text-[#101810] hover:bg-[#bdd5ae]"><Plus size={16}/> New chat</button>
        <button type="button" onClick={() => setHistoryOpen(false)} title="Hide history" className="rounded-xl border border-white/10 p-2.5 text-slate-400 hover:text-white"><PanelLeftClose size={16}/></button>
      </div>
      <div className="p-3">
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[.03] px-2.5"><Search size={15} className="text-slate-500"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search chats" className="min-w-0 flex-1 bg-transparent py-2 text-xs text-white outline-none placeholder:text-slate-500"/></div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 pb-3">
        <div className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-[.15em] text-slate-500">Recent conversations</div>
        {loadingHistory ? <div className="px-3 py-4 text-xs text-slate-500">Loading history…</div> : visibleConversations.length ? visibleConversations.map(item=><div key={item.id} className={`group mb-1 flex items-center gap-1 rounded-xl ${activeId===item.id?'bg-[#a8c49a]/10 border border-[#a8c49a]/20':'border border-transparent hover:bg-white/[.04]'}`}>
          <button type="button" onClick={()=>openConversation(item.id)} className="min-w-0 flex-1 px-3 py-2.5 text-left">
            <div className="truncate text-xs font-medium text-slate-200">{item.title || 'New chat'}</div>
            <div className="mt-1 truncate text-[10px] text-slate-500">{item.preview || 'No messages yet'} <span className="float-right">{formatDate(item.updatedAt)}</span></div>
          </button>
          <div className="flex pr-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100">
            <button type="button" onClick={()=>renameConversation(item)} title="Rename" className="rounded-lg p-1.5 text-slate-500 hover:text-white"><Pencil size={13}/></button>
            <button type="button" onClick={()=>deleteConversation(item)} title="Delete" className="rounded-lg p-1.5 text-slate-500 hover:text-rose-300"><Trash2 size={13}/></button>
          </div>
        </div>) : <p className="px-3 py-4 text-xs leading-5 text-slate-500">Your saved chats will appear here.</p>}
      </div>
      <div className="border-t border-white/10 p-3"><div className="truncate text-[11px] font-medium text-slate-300">{user?.profile?.name || user?.facultyProfile?.name || user?.email}</div><div className="mt-1 text-[10px] text-slate-500">Private chat history for your account</div></div>
    </aside></>}

    <section className="flex h-full min-h-0 min-w-0 flex-1 flex-col">
      <header className="flex items-center gap-3 border-b border-white/10 bg-white/[.025] p-4 sm:p-5">
        {!historyOpen && <button type="button" onClick={()=>setHistoryOpen(true)} title="Show chat history" className="rounded-xl border border-white/10 p-2.5 text-slate-400 hover:text-white"><PanelLeftOpen size={16}/></button>}
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#a8c49a]/15 text-[#b9d5aa]"><Bot size={22}/></span>
        <div className="min-w-0 flex-1"><h1 className="text-lg font-semibold text-slate-100">IIT Connect AI</h1><p className="mt-1 text-xs text-slate-400">{isFaculty ? 'Academic, research and teaching assistant' : 'Your learning, coding and campus assistant'}</p></div>
        {activeId && <button type="button" onClick={()=>deleteConversation(conversations.find(c=>c.id===activeId)||{id:activeId,title:'this chat'})} title="Delete current chat" className="rounded-xl border border-white/10 p-2.5 text-slate-400 hover:text-rose-300"><Trash2 size={16}/></button>}
        <button type="button" onClick={newChat} title="Start new chat" className="rounded-xl border border-white/10 p-2.5 text-slate-400 hover:text-white"><Plus size={16}/></button>
      </header>
      <main ref={messagesRef} className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain p-4 sm:p-6">
        {!messages.length ? <div className="mx-auto max-w-2xl py-8 text-center sm:py-10"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-[#a8c49a]/10 text-[#b9d5aa]"><Sparkles size={30}/></div><h2 className="mt-5 text-2xl font-semibold text-white">What can I help you with?</h2><p className="mt-2 text-sm text-slate-400">Your conversations are saved automatically. Pick up where you left off, or start a new chat.</p><div className="mt-7 grid gap-2 text-left sm:grid-cols-2">{prompts.map(p=><button key={p} onClick={()=>send(p)} className="rounded-2xl border border-white/10 bg-white/[.025] p-4 text-sm text-slate-300 transition hover:border-[#a8c49a]/35 hover:bg-[#a8c49a]/[.06]">{p}</button>)}</div></div> : messages.map((m,i)=><div key={m.id||i} className={m.role==='user'?'flex justify-end gap-3':'flex gap-3'}>{m.role==='assistant'&&<span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#a8c49a]/10 text-[#b9d5aa]"><Bot size={16}/></span>}<div className={m.role==='user'?'max-w-[88%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-7 sm:max-w-[78%] bg-[#a8c49a] text-[#101810]':'max-w-[88%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-7 sm:max-w-[78%] border border-white/10 bg-white/[.04] text-slate-200'}>{m.content}{m.attachments?.length>0&&<div className="mt-2 flex flex-wrap gap-2">{m.attachments.map((file,j)=><span key={file.fileId||j} className="inline-flex items-center gap-1 rounded-lg bg-black/10 px-2 py-1 text-[11px]"><FileText size={12}/> {file.filename}</span>)}</div>}</div>{m.role==='user'&&<span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/10 text-slate-300"><UserRound size={16}/></span>}</div>)}
        {busy&&<div className="flex items-center gap-2 text-xs text-slate-400"><LoaderCircle size={15} className="animate-spin"/> IIT Connect AI is thinking…</div>}

      </main>
      <form onSubmit={e=>{e.preventDefault();send()}} className="border-t border-white/10 bg-black/10 p-4 sm:p-5"><input ref={fileInputRef} type="file" multiple accept="image/*,.pdf,.txt,.csv,.md,.json,.doc,.docx,.pptx,.xlsx" className="hidden" onChange={selectFiles}/><input ref={folderInputRef} type="file" multiple webkitdirectory="" directory="" className="hidden" onChange={selectFiles}/>{attachments.length>0&&<div className="mb-2 flex flex-wrap gap-2">{attachments.map((file,i)=><span key={file.fileId} className="inline-flex max-w-full items-center gap-2 rounded-xl border border-white/10 bg-white/[.04] px-2.5 py-1.5 text-xs text-slate-300"><FileText size={13}/><span className="max-w-[180px] truncate">{file.filename}</span><button type="button" onClick={()=>setAttachments(prev=>prev.filter((_,j)=>j!==i))} aria-label="Remove attachment"><X size={13}/></button></span>)}</div>}<div className="flex items-end gap-2 rounded-2xl border border-white/10 bg-[#0b1411] p-2 focus-within:border-[#a8c49a]/40"><button type="button" disabled={busy||uploading} onClick={()=>fileInputRef.current?.click()} title="Attach files or images" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 text-slate-300 hover:bg-white/5 disabled:opacity-40"><Paperclip size={18}/></button><button type="button" disabled={busy||uploading} onClick={()=>folderInputRef.current?.click()} title="Attach folder" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 text-slate-300 hover:bg-white/5 disabled:opacity-40"><FolderUp size={18}/></button><textarea value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send()}}} rows={2} maxLength={6000} placeholder="Ask IIT Connect AI anything…" className="max-h-40 min-h-[48px] flex-1 resize-y bg-transparent px-2 py-2 text-sm text-white outline-none placeholder:text-slate-500"/><button type="submit" disabled={(!text.trim()&&!attachments.length)||busy||uploading} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#a8c49a] text-[#101810] transition hover:bg-[#bdd5ae] disabled:opacity-40"><Send size={18}/></button></div><p className="mt-2 text-center text-[10px] text-slate-500">AI can make mistakes. Verify important academic or official information.</p></form>
    </section>
  </div>
}
