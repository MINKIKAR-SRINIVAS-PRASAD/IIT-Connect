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

export default function ChatSidebar({ activeId, onSelectConversation, onStartDM, onJoinGroup, onJoinCommunity, onLeaveConversation }) {
  const { user } = useAuth()
  const [q, setQ] = useState('')
  const [users, setUsers] = useState([])
  const [convos, setConvos] = useState([])
  const [showArchived, setShowArchived] = useState(false)
  const currentUserId = getId(user?.id || user?._id)
  const matchingUsers = users.filter((person) => getId(person) !== currentUserId)

  async function loadConvos() {
    const { data } = await api.get('/chat/conversations', { params: { includeArchived: 'true' } })
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

  const convosSorted = useMemo(() => convos.filter((conversation) => Boolean(conversation.preferences?.archived) === showArchived), [convos, showArchived])

  async function updatePreference(conversation, patch) {
    try {
      await api.patch(`/chat/conversations/${conversation._id}/preferences`, patch)
      await loadConvos()
    } catch (error) {
      window.alert(error?.response?.data?.message || 'Could not update chat settings')
    }
  }

  async function leaveGroup(conversation) {
    if (!window.confirm(`Leave ${conversation.title || 'this group'}?`)) return
    try {
      await api.post(`/chat/conversations/${conversation._id}/leave`)
      onLeaveConversation?.(conversation._id)
      await loadConvos()
    } catch (error) {
      window.alert(error?.response?.data?.message || 'Could not leave this group')
    }
  }

  return (
    <aside className="instagram-chat-sidebar w-full shrink-0 border-b md:w-[350px] md:border-b-0 md:border-r">
      <div className="instagram-inbox-top border-b p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-white">Inbox</h2>
            <p className="text-xs text-slate-500">Your conversations</p>
          </div>
          <Button className="chat-ghost-button" variant="ghost" onClick={() => loadConvos().catch(() => {})}>Refresh</Button>
        </div>
        <div className="mt-3">
          <Input label="Search students" value={q} onChange={(event) => setQ(event.target.value)} placeholder="Search by name or roll number..." />
        </div>
        {(() => {
          const hasCommunity = convos.some((conversation) => conversation.type === 'community')
          const hasIitGroup = convos.some((conversation) => conversation.type === 'group')
          if (hasCommunity && hasIitGroup) return null

          return (
            <div className="mt-3 space-y-2">
              {!hasCommunity && (
                <Button className="chat-action-button w-full" onClick={async () => {
                  const conversation = await onJoinCommunity()
                  if (conversation) await loadConvos()
                }}>
                  🌐 Join Indian IIT Students Community
                </Button>
              )}
              {!hasIitGroup && (
                <Button variant="secondary" className="chat-secondary-button w-full" onClick={async () => {
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

      <div className="instagram-inbox-label flex items-center justify-between px-4 pt-3">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{showArchived ? 'Archived chats' : 'Recent conversations'}</div>
        <button type="button" onClick={() => setShowArchived((value) => !value)} className="text-xs text-indigo-300 hover:text-indigo-200">
          {showArchived ? 'Show inbox' : 'Archived'}
        </button>
      </div>
      <div className="instagram-inbox-list max-h-[280px] space-y-2 overflow-y-auto p-3 md:max-h-[calc(72vh-160px)]">
        {convosSorted.map((conversation) => {
          const label = conversationLabel(conversation, currentUserId)
          const photo = conversationAvatar(conversation, currentUserId)
          const prefs = conversation.preferences || {}
          return (
            <div key={conversation._id} className={activeId === conversation._id ? 'rounded-xl border border-indigo-500/50 bg-indigo-500/10 px-2 py-2' : 'rounded-xl border border-slate-800 bg-slate-900/50 px-2 py-2'}>
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => onSelectConversation(conversation)} className="flex min-w-0 flex-1 items-center gap-3 rounded-lg px-1 py-1 text-left">
                  <div className="instagram-avatar flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border text-sm font-semibold">
                    {photo ? <img src={photo} alt={label} className="h-full w-full object-cover" /> : conversation.type === 'dm' ? label.slice(0, 1).toUpperCase() : conversation.type === 'community' ? '🌐' : '👥'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1 truncate text-sm font-semibold text-slate-100">
                      <span className="truncate">{label}</span>
                      {prefs.pinned && <span title="Pinned">📌</span>}
                      {prefs.muted && <span title="Muted">🔕</span>}
                    </div>
                    <div className="truncate text-xs text-slate-400">{conversation.lastMessageText || 'Start a conversation'}</div>
                  </div>
                </button>
                <details className="relative shrink-0">
                  <summary className="flex h-8 w-8 cursor-pointer list-none items-center justify-center rounded-lg text-lg text-slate-300 hover:bg-slate-800" aria-label="Chat options">⋯</summary>
                  <div className="absolute right-0 top-9 z-30 min-w-44 rounded-xl border border-slate-700 bg-slate-900 p-1 shadow-xl">
                    <button type="button" onClick={() => updatePreference(conversation, { pinned: !prefs.pinned })} className="block w-full rounded-lg px-3 py-2 text-left text-xs text-slate-200 hover:bg-slate-800">{prefs.pinned ? 'Unpin chat' : 'Pin chat'}</button>
                    <button type="button" onClick={() => updatePreference(conversation, { muted: !prefs.muted })} className="block w-full rounded-lg px-3 py-2 text-left text-xs text-slate-200 hover:bg-slate-800">{prefs.muted ? 'Unmute chat' : 'Mute chat'}</button>
                    <button type="button" onClick={() => updatePreference(conversation, { archived: !prefs.archived })} className="block w-full rounded-lg px-3 py-2 text-left text-xs text-slate-200 hover:bg-slate-800">{prefs.archived ? 'Move to inbox' : 'Archive chat'}</button>
                    {conversation.type !== 'dm' && !showArchived && <button type="button" onClick={() => leaveGroup(conversation)} className="block w-full rounded-lg px-3 py-2 text-left text-xs text-rose-300 hover:bg-slate-800">Leave group</button>}
                  </div>
                </details>
              </div>
            </div>
          )
        })}
        {!convosSorted.length && <p className="px-2 py-3 text-sm text-slate-500">{showArchived ? 'No archived chats.' : 'No conversations yet.'}</p>}

        {!showArchived && <>
          <div className="px-1 pb-1 pt-4 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Find students</div>
          {matchingUsers.map((person) => (
            <div key={person._id} className="flex items-center gap-3 rounded-xl border border-slate-800/80 bg-slate-900/30 p-3">
              <div className="instagram-avatar instagram-find-avatar flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full text-xs font-semibold">
                {person.profile?.photoUrl ? <img src={person.profile.photoUrl} alt={person.profile?.name || 'Student'} className="h-full w-full object-cover" /> : (person.profile?.name || 'S').slice(0, 1).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-slate-100">{person.profile?.name || 'Student'}</div>
                {person.profile?.rollNumber && <div className="truncate text-[11px] text-slate-500">{person.profile.rollNumber}</div>}
                <div className="truncate text-xs text-slate-400">{[person.profile?.iit, person.profile?.branch].filter(Boolean).join(' • ') || 'IIT student'}</div>
              </div>
              <Button size="sm" className="chat-action-button" onClick={() => onStartDM(person._id)}>Message</Button>
            </div>
          ))}
          {q.trim() && matchingUsers.length === 0 && <p className="px-2 py-4 text-sm text-slate-400">No students found for “{q.trim()}”. Try a name or roll number.</p>}
        </>}
      </div>
    </aside>
  )
}
