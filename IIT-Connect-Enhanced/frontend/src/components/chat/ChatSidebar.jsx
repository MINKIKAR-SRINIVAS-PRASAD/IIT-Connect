import React, { useEffect, useMemo, useState } from 'react'
import Input from '../common/Input'
import Button from '../common/Button'
import { api } from '../../utils/api'
import { useAuth } from '../../hooks/useAuth'

function getId(value) {
  if (!value) return ''
  return typeof value === 'object' ? String(value._id || value.id || '') : String(value)
}

function conversationLabel(conversation, currentUserId) {
  if (conversation.type === 'group') return conversation.title || 'Institute group'
  if (conversation.type === 'community') return conversation.title || 'IIT Connect Community'
  const other = (conversation.participants || []).find((person) => getId(person) !== currentUserId)
  return other?.profile?.name || 'Direct message'
}

function conversationAvatar(conversation, currentUserId) {
  if (conversation.type !== 'dm') return null
  return (conversation.participants || []).find((person) => getId(person) !== currentUserId)?.profile?.photoUrl || ''
}

export default function ChatSidebar({ activeId, onSelectConversation, onStartDM, onJoinGroup, onJoinCommunity }) {
  const { user } = useAuth()
  const [q, setQ] = useState('')
  const [users, setUsers] = useState([])
  const [convos, setConvos] = useState([])
  const currentUserId = getId(user?.id || user?._id)

  async function loadConvos() {
    const { data } = await api.get('/chat/conversations')
    setConvos(data.conversations || [])
  }

  async function searchUsers() {
    const { data } = await api.get('/chat/users', { params: { q } })
    setUsers(data.users || [])
  }

  useEffect(() => {
    loadConvos().catch(() => {})
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => searchUsers().catch(() => {}), 250)
    return () => clearTimeout(timer)
  }, [q])

  const convosSorted = useMemo(() => convos, [convos])

  return (
    <aside className="w-full shrink-0 border-b border-slate-800 bg-slate-950 md:w-[340px] md:border-b-0 md:border-r">
      <div className="border-b border-slate-800 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-white">Messages</h2>
            <p className="text-xs text-slate-500">Your IIT Connect inbox</p>
          </div>
          <Button variant="ghost" onClick={() => loadConvos().catch(() => {})}>Refresh</Button>
        </div>
        <div className="mt-3">
          <Input label="Search students" value={q} onChange={(event) => setQ(event.target.value)} placeholder="Search by name or institute..." />
        </div>
        {(() => {
          const hasCommunity = convos.some((conversation) => conversation.type === 'community')
          const hasIitGroup = convos.some((conversation) => conversation.type === 'group')
          if (hasCommunity && hasIitGroup) return null

          return (
            <div className="mt-3 space-y-2">
              {!hasCommunity && (
                <Button className="w-full" onClick={async () => {
                  const conversation = await onJoinCommunity()
                  if (conversation) await loadConvos()
                }}>
                  🌐 Join Indian IIT Students Community
                </Button>
              )}
              {!hasIitGroup && (
                <Button variant="secondary" className="w-full" onClick={async () => {
                  await onJoinGroup(user?.profile?.iit)
                  await loadConvos()
                }}>
                  + Join My IIT Group
                </Button>
              )}
            </div>
          )
        })()}
      </div>

      <div className="max-h-[280px] space-y-2 overflow-y-auto p-3 md:max-h-[calc(70vh-190px)]">
        <div className="px-1 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Recent conversations</div>
        {convosSorted.map((conversation) => {
          const label = conversationLabel(conversation, currentUserId)
          const photo = conversationAvatar(conversation, currentUserId)
          return (
            <button
              key={conversation._id}
              onClick={() => onSelectConversation(conversation)}
              className={`flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition ${activeId === conversation._id
                ? 'border-indigo-500/50 bg-indigo-500/10'
                : 'border-transparent bg-slate-900/50 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-700 bg-slate-800 text-sm font-semibold text-slate-200">
                {photo ? <img src={photo} alt={label} className="h-full w-full object-cover" /> : conversation.type === 'dm' ? label.slice(0, 1).toUpperCase() : conversation.type === 'community' ? '🌐' : '👥'}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-slate-100">{label}</div>
                <div className="truncate text-xs text-slate-400">{conversation.lastMessageText || 'Start a conversation'}</div>
              </div>
              {activeId === conversation._id && <span className="h-2 w-2 shrink-0 rounded-full bg-indigo-400" />}
            </button>
          )
        })}
        {!convosSorted.length && <p className="px-2 py-3 text-sm text-slate-500">No conversations yet.</p>}

        <div className="px-1 pb-1 pt-4 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Find students</div>
        {users
          .filter((person) => getId(person) !== currentUserId)
          .map((person) => (
            <div key={person._id} className="flex items-center gap-3 rounded-xl border border-slate-800/80 bg-slate-900/30 p-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-800 text-xs font-semibold text-slate-200">
                {person.profile?.photoUrl ? (
                  <img src={person.profile.photoUrl} alt={person.profile?.name || 'Student'} className="h-full w-full object-cover" />
                ) : (person.profile?.name || 'S').slice(0, 1).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-slate-100">{person.profile?.name || 'Student'}</div>
                <div className="truncate text-xs text-slate-400">{[person.profile?.iit, person.profile?.branch].filter(Boolean).join(' • ') || 'IIT student'}</div>
              </div>
              <Button size="sm" onClick={() => onStartDM(person._id)}>Message</Button>
            </div>
          ))}
      </div>
    </aside>
  )
}
