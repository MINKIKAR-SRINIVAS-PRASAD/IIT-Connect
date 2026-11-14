import { Server } from 'socket.io'
import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import User from '../models/User.js'
import Conversation from '../models/Conversation.js'
import Message from '../models/Message.js'

const onlineUsers = new Map() // userId -> Set<socketId>
const eventLimits = new Map() // userId:event -> { startedAt, count }

function parseCookie(cookieHeader = '') {
  const out = {}
  cookieHeader.split(';').forEach((part) => {
    const index = part.indexOf('=')
    if (index < 0) return
    const key = part.slice(0, index).trim()
    const value = part.slice(index + 1).trim()
    try {
      out[key] = decodeURIComponent(value)
    } catch {
      // Ignore malformed cookie values.
    }
  })
  return out
}

async function authFromHandshake(socket) {
  const cookies = parseCookie(socket.handshake.headers.cookie || '')
  const token = cookies.accessToken
  if (!token) return null

  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET)
    const user = await User.findById(payload.sub).select('email role profile isBanned')
    if (!user || user.isBanned) return null
    return user
  } catch {
    return null
  }
}

function isConversationMember(conversation, userId) {
  if (!conversation) return false
  if (conversation.type === 'community') return true
  return conversation.participants.some((participant) => participant.toString() === userId)
}

async function findAuthorizedConversation(conversationId, userId) {
  if (!conversationId || typeof conversationId !== 'string') return null
  const conversation = await Conversation.findById(conversationId)
  return isConversationMember(conversation, userId) ? conversation : null
}

function allowUserEvent(userId, event, limit, windowMs = 60_000) {
  const key = `${userId}:${event}`
  const now = Date.now()
  const current = eventLimits.get(key)
  if (!current || now - current.startedAt >= windowMs) {
    eventLimits.set(key, { startedAt: now, count: 1 })
    return true
  }
  if (current.count >= limit) return false
  current.count += 1
  return true
}

export function initSocket(httpServer, corsOrigin) {
  const io = new Server(httpServer, {
    cors: {
      origin: corsOrigin,
      credentials: true
    }
  })

  io.use(async (socket, next) => {
    try {
      const user = await authFromHandshake(socket)
      if (!user) return next(new Error('Unauthorized'))
      socket.data.user = user
      next()
    } catch {
      next(new Error('Unauthorized'))
    }
  })

  io.on('connection', (socket) => {
    const user = socket.data.user
    const userId = user._id.toString()
    const sockets = onlineUsers.get(userId) || new Set()
    const wasOffline = sockets.size === 0
    sockets.add(socket.id)
    onlineUsers.set(userId, sockets)


    if (wasOffline) {
      socket.broadcast.emit('presence:update', { userId, status: 'online' })
    }

    socket.on('conversation:join', async (payload = {}) => {
      try {
        if (!allowUserEvent(userId, 'join', 30)) return
        const conversationId = payload?.conversationId
        const conversation = await findAuthorizedConversation(conversationId, userId)
        if (!conversation) return
        socket.join(conversation._id.toString())
      } catch (error) {
        console.error('Conversation join failed:', error.message)
      }
    })

    socket.on('conversation:typing', async (payload = {}) => {
      try {
        if (!allowUserEvent(userId, 'typing', 60)) return
        const { conversationId, isTyping } = payload || {}
        const conversation = await findAuthorizedConversation(conversationId, userId)
        if (!conversation) return
        const roomId = conversation._id.toString()
        if (!socket.rooms.has(roomId)) return
        socket.to(roomId).emit('conversation:typing', {
          conversationId: roomId,
          userId,
          isTyping: Boolean(isTyping)
        })
      } catch (error) {
        console.error('Typing event failed:', error.message)
      }
    })

    socket.on('message:send', async (payload = {}) => {
      try {
        if (!allowUserEvent(userId, 'message', 20)) return
        const { conversationId, text } = payload || {}
        if (typeof text !== 'string') return
        const cleanText = text.trim()
        if (!cleanText || cleanText.length > 2000) return

        const conversation = await findAuthorizedConversation(conversationId, userId)
        if (!conversation) return

        const roomId = conversation._id.toString()
        const msg = await Message.create({
          conversationId: conversation._id,
          senderId: user._id,
          text: cleanText,
          seenBy: [user._id]
        })

        conversation.lastMessageAt = new Date()
        conversation.lastMessageText = msg.text
        await conversation.save()

        io.to(roomId).emit('message:new', {
          _id: msg._id,
          conversationId: roomId,
          senderId: userId,
          text: msg.text,
          createdAt: msg.createdAt,
          seenBy: msg.seenBy
        })
      } catch (error) {
        console.error('Message send failed:', error.message)
      }
    })

    socket.on('message:seen', async (payload = {}) => {
      try {
        if (!allowUserEvent(userId, 'seen', 60)) return
        const { conversationId } = payload || {}
        const conversation = await findAuthorizedConversation(conversationId, userId)
        if (!conversation) return

        const roomId = conversation._id.toString()
        await Message.updateMany(
          { conversationId: conversation._id, seenBy: { $ne: user._id } },
          { $addToSet: { seenBy: user._id } }
        )
        socket.to(roomId).emit('message:seen', { conversationId: roomId, userId })
      } catch (error) {
        console.error('Message seen update failed:', error.message)
      }
    })

    socket.emit('presence:bootstrap', {
      onlineUserIds: Array.from(onlineUsers.keys())
    })

    socket.on('disconnect', async () => {
      const activeSockets = onlineUsers.get(userId)
      if (activeSockets) {
        activeSockets.delete(socket.id)
        if (activeSockets.size === 0) {
          onlineUsers.delete(userId)
          for (const key of eventLimits.keys()) {
            if (key.startsWith(`${userId}:`)) eventLimits.delete(key)
          }
          try {
            await User.updateOne({ _id: userId }, { $set: { lastSeenAt: new Date() } })
          } catch (error) {
            console.error('Last-seen update failed:', error.message)
          }
          socket.broadcast.emit('presence:update', { userId, status: 'offline' })
        }
      }
    })
  })

  return io
}
