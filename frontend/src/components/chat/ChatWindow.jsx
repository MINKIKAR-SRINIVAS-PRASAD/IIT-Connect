
import React, {
  useContext,
  useEffect,
  useRef,
  useState
} from 'react'

import toast from 'react-hot-toast'
import { api } from '../../utils/api'
import { useAuth } from '../../hooks/useAuth'
import { SocketContext } from '../../context/SocketContext'

export default function ChatWindow({ conversation }) {
  const { user } = useAuth()
  const { socket } = useContext(SocketContext)

  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)

  const bottomRef = useRef(null)

  const currentUserId = String(
    user?._id || user?.id || ''
  )

  const getSenderId = (message) => {
    const sender = message.senderId

    return String(
      sender?._id || sender || ''
    )
  }

  const getSenderName = (message) => {
    return (
      message.senderName ||
      message.senderId?.profile?.name ||
      message.senderId?.email?.split('@')[0] ||
      'Student'
    )
  }

  const formatTime = (date) => {
    if (!date) return ''

    return new Date(date).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Load message history
  useEffect(() => {
    if (!conversation?._id) {
      setMessages([])
      return
    }

    let cancelled = false

    async function loadMessages() {
      try {
        setLoading(true)

        const { data } = await api.get(
          `/chat/messages/${conversation._id}`
        )

        if (!cancelled) {
          setMessages(data.messages || [])
        }
      } catch (error) {
        if (!cancelled) {
          toast.error(
            error?.response?.data?.message ||
            'Unable to load messages'
          )
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadMessages()

    return () => {
      cancelled = true
    }
  }, [conversation?._id])

  // Join conversation and receive real-time messages
  useEffect(() => {
    if (!socket || !conversation?._id) return

    const conversationId = conversation._id

    const joinConversation = () => {
      socket.emit('conversation:join', {
        conversationId
      })
    }

    joinConversation()

    socket.on('connect', joinConversation)

    const handleNewMessage = (message) => {
      if (
        String(message.conversationId) !==
        String(conversationId)
      ) {
        return
      }

      setMessages((previous) => {
        const exists = previous.some(
          item => String(item._id) === String(message._id)
        )

        if (exists) return previous

        return [...previous, message]
      })
    }

    socket.on('message:new', handleNewMessage)

    return () => {
      socket.off('connect', joinConversation)
      socket.off('message:new', handleNewMessage)
    }
  }, [socket, conversation?._id])

  // Scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: 'smooth'
    })
  }, [messages])

  // Send message
  const sendMessage = (e) => {
    e.preventDefault()

    const messageText = text.trim()

    if (!messageText || !conversation?._id) return

    if (!socket?.connected) {
      toast.error('Chat connection unavailable')
      return
    }

    socket.emit('message:send', {
      conversationId: conversation._id,
      text: messageText
    })

    setText('')
  }

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center
        justify-center bg-slate-950">
        <p className="text-slate-500">
          Select a conversation to start chatting
        </p>
      </div>
    )
  }

  return (
    <section className="flex-1 min-w-0 flex flex-col
      bg-slate-950">

      {/* Conversation header */}
      <header className="border-b border-slate-800
        px-5 py-5">
        <h2 className="text-lg font-bold text-white">
          {conversation.title ||
            conversation.displayName ||
            (conversation.type === 'dm'
              ? 'Direct message'
              : 'Group Chat')}
        </h2>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto
        p-5 space-y-4">

        {loading && (
          <p className="text-center text-slate-500">
            Loading messages...
          </p>
        )}

        {!loading && messages.length === 0 && (
          <p className="text-center text-slate-500 mt-10">
            No messages yet. Start the conversation!
          </p>
        )}

        {messages.map((message) => {
          const isOwnMessage =
            getSenderId(message) === currentUserId

          return (
            <div
              key={message._id}
              className={`flex ${
                isOwnMessage
                  ? 'justify-end'
                  : 'justify-start'
              }`}
            >
              <div className="max-w-[80%]">

                {/* Sender name */}
                {!isOwnMessage && (
                  <p className="text-xs font-semibold
                    text-indigo-400 mb-1 ml-1">
                    {getSenderName(message)}
                  </p>
                )}

                {/* Message bubble */}
                <div className={`rounded-2xl px-4 py-3
                  border ${
                    isOwnMessage
                      ? 'bg-indigo-600/20 border-indigo-500/40 text-white'
                      : 'bg-slate-900 border-slate-800 text-white'
                  }`}>

                  <p className="break-words whitespace-pre-wrap">
                    {message.text}
                  </p>

                  <div className="flex items-center
                    justify-end gap-2 mt-2">
                    <span className="text-xs text-slate-400">
                      {formatTime(message.createdAt)}
                    </span>

                    {isOwnMessage && (
                      <span className="text-xs text-indigo-300">
                        Sent
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}

        <div ref={bottomRef} />
      </div>

      {/* Message input */}
      <form
        onSubmit={sendMessage}
        className="border-t border-slate-800
          p-4 flex gap-3"
      >
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 min-w-0 rounded-xl
            bg-slate-900 border border-slate-800
            px-4 py-3 text-white outline-none
            focus:border-indigo-500"
        />

        <button
          type="submit"
          disabled={!text.trim()}
          className="rounded-xl bg-indigo-600
            hover:bg-indigo-500 disabled:opacity-50
            px-6 py-3 text-white font-semibold"
        >
          Send
        </button>
      </form>
    </section>
  )
}
