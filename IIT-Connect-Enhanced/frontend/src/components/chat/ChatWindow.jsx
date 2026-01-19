import React, { useEffect, useMemo, useRef, useState } from 'react'
import Button from '../common/Button'
import Input from '../common/Input'
import MessageBubble from './MessageBubble'
import TypingIndicator from './TypingIndicator'
import { api } from '../../utils/api'
import { useAuth } from '../../hooks/useAuth'
import { useSocket } from '../../hooks/useSocket'

export default function ChatWindow({ conversation }) {
  const { user } = useAuth()
  const { socket } = useSocket()

  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [typing, setTyping] = useState(false)
  const [typingOther, setTypingOther] = useState(false)

  const listRef = useRef(null)

  async function loadMessages() {
    if (!conversation?._id) return
    const { data } = await api.get(`/chat/messages/${conversation._id}`)
    setMessages(data.messages)
  }

  useEffect(() => {
    loadMessages().catch(() => {})
  }, [conversation?._id])

  useEffect(() => {
    if (!socket || !conversation?._id) return

    socket.emit('conversation:join', { conversationId: conversation._id })
    socket.emit('message:seen', { conversationId: conversation._id })

    const onNew = (m) => {
      if (m.conversationId !== conversation._id) return
      setMessages((prev) => [...prev, m])
      setTimeout(() => {
        socket.emit('message:seen', { conversationId: conversation._id })
      }, 120)
    }

    const onTyping = (p) => {
      if (p.conversationId !== conversation._id) return
      if (p.userId === user?.id) return
      setTypingOther(!!p.isTyping)
    }

    const onSeen = (p) => {
      if (p.conversationId !== conversation._id) return
      // optimistic UI: we compute seen for last msg only
      setMessages((prev) => [...prev])
    }

    socket.on('message:new', onNew)
    socket.on('conversation:typing', onTyping)
    socket.on('message:seen', onSeen)

    return () => {
      socket.off('message:new', onNew)
      socket.off('conversation:typing', onTyping)
      socket.off('message:seen', onSeen)
    }
  }, [socket, conversation?._id])

  useEffect(() => {
    if (!listRef.current) return
    listRef.current.scrollTop = listRef.current.scrollHeight
  }, [messages.length])

  const lastMsg = useMemo(() => messages[messages.length - 1], [messages])

  async function send() {
    if (!socket || !conversation?._id) return
    const t = text.trim()
    if (!t) return
    socket.emit('message:send', { conversationId: conversation._id, text: t })
    setText('')
    socket.emit('conversation:typing', { conversationId: conversation._id, isTyping: false })
    setTyping(false)
  }

  function onTextChange(e) {
    const v = e.target.value
    setText(v)

    if (!socket || !conversation?._id) return
    const isNowTyping = v.length > 0
    if (isNowTyping !== typing) {
      setTyping(isNowTyping)
      socket.emit('conversation:typing', { conversationId: conversation._id, isTyping: isNowTyping })
    }
  }

  if (!conversation) {
    return (
      <div className="flex-1 p-6">
        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6 text-slate-300">
          Select a conversation or start a new DM.
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 min-w-0 flex flex-col">
      <div className="border-b border-slate-900 p-4">
        <div className="font-semibold">{conversation.type === 'group' ? conversation.title : 'Direct Message'}</div>
        <div className="mt-1">
          <TypingIndicator show={typingOther} />
        </div>
      </div>

      <div ref={listRef} className="flex-1 overflow-auto p-4 space-y-3">
        {messages.map((m) => {
          const me = (m.senderId?.toString?.() || m.senderId) === user?.id
          const seen = !!(lastMsg && lastMsg._id === m._id && (m.seenBy || []).length > 1)
          return <MessageBubble key={m._id} me={me} msg={m} isSeen={seen} />
        })}
      </div>

      <div className="border-t border-slate-900 p-4">
        <div className="flex gap-2">
          <Input
            className="flex-1"
            label={null}
            value={text}
            onChange={onTextChange}
            placeholder="Type a message..."
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                send()
              }
            }}
          />
          <Button onClick={send}>Send</Button>
        </div>
      </div>
    </div>
  )
}
