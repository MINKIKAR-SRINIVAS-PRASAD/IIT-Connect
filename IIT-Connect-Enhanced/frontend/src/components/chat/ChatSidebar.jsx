import React, { useEffect, useMemo, useState } from 'react'
import Input from '../common/Input'
import Button from '../common/Button'
import { api } from '../../utils/api'
import { useAuth } from '../../hooks/useAuth'

export default function ChatSidebar({ activeId, onSelectConversation, onStartDM, onJoinGroup }) {
  const { user } = useAuth()
  const [q, setQ] = useState('')
  const [users, setUsers] = useState([])
  const [convos, setConvos] = useState([])

  async function loadConvos() {
    const { data } = await api.get('/chat/conversations')
    setConvos(data.conversations)
  }

  async function searchUsers() {
    const { data } = await api.get('/chat/users', { params: { q } })
    setUsers(data.users)
  }

  useEffect(() => {
    loadConvos()
  }, [])

  useEffect(() => {
    const t = setTimeout(() => {
      searchUsers().catch(() => {})
    }, 250)
    return () => clearTimeout(t)
  }, [q])

  const convosSorted = useMemo(() => convos, [convos])

  return (
    <aside className="w-full md:w-96 border-r border-slate-900 bg-slate-950">
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="font-semibold">Chats</div>
          <Button variant="ghost" onClick={loadConvos}>Refresh</Button>
        </div>
        <div className="mt-3">
          <Input label="Search users" value={q} onChange={(e) => setQ(e.target.value)} placeholder="name / email / IIT" />
        </div>
        <div className="mt-3 flex gap-2">
          <Button className="flex-1" onClick={() => onJoinGroup(user?.profile?.iit)}>
            Join IIT Group
          </Button>
        </div>
      </div>

      <div className="px-4 pb-4">
        <div className="text-xs text-slate-400">Your conversations</div>
        <div className="mt-2 space-y-2">
          {convosSorted.map((c) => (
            <button
              key={c._id}
              onClick={() => onSelectConversation(c)}
              className={`w-full text-left rounded-2xl border px-3 py-2 transition ${
                activeId === c._id ? 'border-indigo-500/60 bg-indigo-600/10' : 'border-slate-800 hover:bg-slate-900'
              }`}
            >
              <div className="text-sm font-medium">
                {c.type === 'group' ? c.title : 'Direct message'}
              </div>
              <div className="text-xs text-slate-400 truncate">{c.lastMessageText || 'No messages yet'}</div>
            </button>
          ))}
          {!convosSorted.length ? (
            <div className="text-sm text-slate-400">No conversations yet.</div>
          ) : null}
        </div>

        <div className="mt-6 text-xs text-slate-400">Users</div>
        <div className="mt-2 space-y-2">
          {users
            .filter((u) => u._id !== user?.id && u.email !== user?.email)
            .map((u) => (
              <div key={u._id} className="rounded-2xl border border-slate-800 p-3">
                <div className="text-sm font-medium truncate">{u.profile?.name || u.email}</div>
                <div className="text-xs text-slate-400 truncate">{u.profile?.iit || '—'}</div>
                <div className="mt-2">
                  <Button className="w-full" onClick={() => onStartDM(u._id)}>
                    Message
                  </Button>
                </div>
              </div>
            ))}
        </div>
      </div>
    </aside>
  )
}
