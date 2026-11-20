import React, { useEffect, useMemo, useRef, useState } from 'react'
import Button from '../common/Button'
import Input from '../common/Input'
import MessageBubble from './MessageBubble'
import TypingIndicator from './TypingIndicator'
import { api } from '../../utils/api'
import { useAuth } from '../../hooks/useAuth'
import { useSocket } from '../../hooks/useSocket'

function getId(value) {
  if (!value) return ''
  return typeof value === 'object' ? String(value._id || value.id || '') : String(value)
}

function getName(person) {
  return person?.profile?.name || (person?.role === 'admin' ? 'Admin' : 'Student')
}

function Avatar({ person, size = 'h-10 w-10' }) {
  const name = getName(person)
  const initials = name.split(/\s+/).slice(0, 2).map((part) => part[0] || '').join('').toUpperCase()
  return (
    <div className={`${size} shrink-0 overflow-hidden rounded-full border border-slate-700 bg-slate-800 flex items-center justify-center text-xs font-semibold text-slate-200`}>
      {person?.profile?.photoUrl ? (
        <img src={person.profile.photoUrl} alt={name} className="h-full w-full object-cover" />
      ) : initials}
    </div>
  )
}

export default function ChatWindow({ conversation }) {
  const { user } = useAuth()
  const { socket } = useSocket()

  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [typing, setTyping] = useState(false)
  const [typingOther, setTypingOther] = useState(false)
  const [sending, setSending] = useState(false)
  const listRef = useRef(null)

  const currentUserId = getId(user?.id || user?._id)
  const otherParticipant = useMemo(() => {
    if (!conversation || conversation.type !== 'dm') return null
    return (conversation.participants || []).find((person) => getId(person) !== currentUserId) || null
  }, [conversation, currentUserId])

  const title = conversation?.type === 'dm'
    ? getName(otherParticipant)
    : conversation?.title || (conversation?.type === 'community' ? 'Indian IIT Students Community' : 'Group Chat')

  async function loadMessages() {
    if (!conversation?._id) return
    const { data } = await api.get(`/chat/messages/${conversation._id}`)
    setMessages(data.messages || [])
  }

  useEffect(() => {
    setMessages([])
    setText('')
    setTyping(false)
    setTypingOther(false)
    if (conversation?._id) loadMessages().catch(() => {})
  }, [conversation?._id])

  useEffect(() => {
    if (!socket || !conversation?._id) return

    socket.emit('conversation:join', { conversationId: conversation._id })
    socket.emit('message:seen', { conversationId: conversation._id })

    const onNew = (message) => {
      if (message.conversationId !== conversation._id) return
      setMessages((previous) => {
        if (previous.some((item) => item._id === message._id)) return previous
        return [...previous, message]
      })
      socket.emit('message:seen', { conversationId: conversation._id })
    }

    const onTyping = (payload) => {
      if (payload.conversationId !== conversation._id) return
      if (payload.userId === currentUserId) return
      setTypingOther(Boolean(payload.isTyping))
    }

    const onSeen = (payload) => {
      if (payload.conversationId !== conversation._id) return
      setMessages((previous) => previous.map((message, index) => (
        index === previous.length - 1
          ? { ...message, seenBy: [...(message.seenBy || []), payload.userId] }
          : message
      )))
    }

    socket.on('message:new', onNew)
    socket.on('conversation:typing', onTyping)
    socket.on('message:seen', onSeen)

    return () => {
      socket.off('message:new', onNew)
      socket.off('conversation:typing', onTyping)
      socket.off('message:seen', onSeen)
    }
  }, [socket, conversation?._id, currentUserId])

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages.length, typingOther])

  const lastMsg = useMemo(() => messages[messages.length - 1], [messages])

  async function send() {
    if (!conversation?._id || sending) return
    const cleanText = text.trim()
    if (!cleanText) return

    setSending(true)
    try {
      // Use authenticated HTTP for durable delivery; realtime sockets are for fan-out.
      const { data } = await api.post('/chat/messages', {
        conversationId: conversation._id,
        text: cleanText
      })
      const savedMessage = data?.message
      if (!data?.success || !savedMessage?._id) {
        throw new Error(data?.message || 'Message could not be saved. Please try again.')
      }

      setMessages((previous) => previous.some((item) => item._id === savedMessage._id)
        ? previous
        : [...previous, savedMessage])
      setText('')
      if (socket) {
        socket.emit('conversation:typing', { conversationId: conversation._id, isTyping: false })
      }
      setTyping(false)
    } catch (error) {
      window.alert(error?.response?.data?.message || error?.message || 'Message could not be sent. Please try again.')
    } finally {
      setSending(false)
    }
  }

  function onTextChange(event) {
    const value = event.target.value
    setText(value)
    if (!socket || !conversation?._id) return
    const isNowTyping = value.length > 0
    if (isNowTyping !== typing) {
      setTyping(isNowTyping)
      socket.emit('conversation:typing', { conversationId: conversation._id, isTyping: isNowTyping })
    }
  }

  if (!conversation) {
    return (
      <div className="flex min-h-[420px] flex-1 items-center justify-center p-6">
        <div className="max-w-sm text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-indigo-500/20 bg-indigo-500/10 text-3xl">💬</div>
          <h3 className="text-lg font-semibold text-white">Your conversations</h3>
          <p className="mt-2 text-sm text-slate-400">Choose a student or open a conversation to start chatting.</p>
        </div>
      </div>
    )
  }

  return (
    <section className="chat-window flex min-h-[520px] min-w-0 flex-1 flex-col bg-slate-950/70">
      <header className="flex items-center gap-3 border-b border-slate-800 bg-slate-950/90 px-4 py-3">
        {conversation.type === 'dm' ? (
          <Avatar person={otherParticipant} />
        ) : (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-indigo-500/30 bg-indigo-500/15 text-lg">
            {conversation.type === 'community' ? '🌐' : '👥'}
          </div>
        )}
        <div className="chat-message-input min-w-0 flex-1">
          <h2 className="truncate font-semibold text-white">{title}</h2>
          <p className="truncate text-xs text-slate-400">
            {conversation.type === 'dm'
              ? [otherParticipant?.profile?.iit, otherParticipant?.profile?.branch].filter(Boolean).join(' • ') || 'Direct message'
              : conversation.type === 'community' ? 'Connect with students across institutes' : 'Institute group conversation'}
          </p>
          {typingOther && <div className="mt-1"><TypingIndicator show /></div>}
        </div>
        <div className="hidden rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] text-emerald-300 sm:block">
          {conversation.type === 'community' ? 'All IITs community' : conversation.type === 'group' ? 'Institute group' : 'Private chat'}
        </div>
      </header>

      <div ref={listRef} className="chat-message-list flex-1 space-y-4 overflow-y-auto px-4 py-5 md:px-6">
        {messages.length === 0 ? (
          <div className="flex h-full min-h-[260px] flex-col items-center justify-center text-center">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-700 bg-slate-900 text-2xl">✉️</div>
            <p className="font-medium text-slate-200">No messages yet</p>
            <p className="mt-1 text-sm text-slate-500">Say hello and start the conversation.</p>
          </div>
        ) : (
          messages.map((message, index) => {
            const senderId = getId(message.senderId)
            const me = senderId === currentUserId
            const seen = Boolean(lastMsg && lastMsg._id === message._id && (message.seenBy || []).map(getId).some((id) => id !== currentUserId))
            const previousSenderId = index > 0 ? getId(messages[index - 1].senderId) : ''
            const showSender = conversation.type !== 'dm' && senderId !== previousSenderId
            return (
              <MessageBubble
                key={message._id}
                me={me}
                msg={message}
                isSeen={seen}
                showSender={showSender || conversation.type === 'dm'}
              />
            )
          })
        )}
      </div>

      <footer className="chat-composer border-t border-slate-800 p-3 md:p-4">
        <div className="chat-composer-inner flex items-end gap-2 rounded-2xl border border-slate-700 p-2">
          <Input
            className="min-w-0 flex-1"
            label={null}
            value={text}
            onChange={onTextChange}
            placeholder="Write a message..."
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault()
                send()
              }
            }}
          />
          <Button className="chat-action-button" onClick={send} disabled={!text.trim() || !socket || sending}>
            {sending ? 'Sending…' : 'Send'}
          </Button>
        </div>
        <p className="mt-2 px-1 text-[10px] text-slate-500">Enter to send · Shift + Enter for a new line</p>
      </footer>
    </section>
  )
}
