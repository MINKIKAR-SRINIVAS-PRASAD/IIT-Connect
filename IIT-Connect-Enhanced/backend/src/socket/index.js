import { Server } from 'socket.io'
import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import User from '../models/User.js'
import Conversation from '../models/Conversation.js'
import Message from '../models/Message.js'
import { isProfileComplete } from '../utils/profileCompletion.js'

let socketServer = null
const onlineUsers = new Map() // userId -> Set<socketId>
const eventLimits = new Map() // userId:event -> { startedAt, count }
const activeConversationByUser = new Map() // userId:event -> { startedAt, count }

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
    // Students cannot establish protected realtime connections until onboarding is complete.
    if (user.role !== 'admin' && !isProfileComplete(user)) return null
    return user
  } catch {
    return null
  }
}

function isConversationMember(conversation, userId) {
  if (!conversation) return false
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

export function isUserViewingConversation(userId, conversationId) {
  return activeConversationByUser.get(String(userId)) === String(conversationId)
}

export function broadcastMessageToConversation(conversationId, message) {
  if (!socketServer) return
  socketServer.to(String(conversationId)).emit('message:new', message)
}

export function notifyAdminsOfContentDeletion(notification) {
  if (!socketServer) return
  socketServer.to('admins').emit('admin:content-deleted', notification)
}

export function removeUserFromConversation(userId, conversationId) {
  if (!socketServer) return
  const socketIds = Array.from(onlineUsers.get(String(userId)) || [])
  if (socketIds.length) socketServer.in(socketIds).socketsLeave(String(conversationId))
}

export function initSocket(httpServer, corsOrigin) {
  const io = new Server(httpServer, {
    cors: {
      origin: Array.isArray(corsOrigin) ? corsOrigin : [corsOrigin],
      credentials: true
    }
  })

  socketServer = io

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
    if (user.role === 'admin') socket.join('admins')
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
        socket.emit('conversation:joined', { conversationId: conversation._id.toString() })
      } catch (error) {
        console.error('Conversation join failed:', error.message)
      }
    })

    socket.on('conversation:active', async (payload = {}) => {
      try {
        const conversation = await findAuthorizedConversation(payload?.conversationId, userId)
        if (conversation) activeConversationByUser.set(userId, conversation._id.toString())
      } catch (error) {
        console.error('Active conversation update failed:', error.message)
      }
    })

    socket.on('conversation:inactive', () => {
      activeConversationByUser.delete(userId)
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

    socket.on('message:send', async (payload = {}, acknowledge = () => {}) => {
      const ack = typeof acknowledge === 'function' ? acknowledge : () => {}
      try {
        if (!allowUserEvent(userId, 'message', 20)) {
          ack({ success: false, message: 'You are sending messages too quickly. Please wait and try again.' })
          return
        }
        const { conversationId, text } = payload || {}
        if (typeof text !== 'string') {
          ack({ success: false, message: 'Message text is invalid.' })
          return
        }
        const cleanText = text.trim()
        if (!cleanText || cleanText.length > 2000) {
          ack({ success: false, message: 'Message must contain 1–2000 characters.' })
          return
        }

        const conversation = await findAuthorizedConversation(conversationId, userId)
        if (!conversation) {
          ack({ success: false, message: 'You are not a member of this conversation. Refresh and reopen it.' })
          return
        }

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

        const messagePayload = {
          _id: msg._id.toString(),
          conversationId: roomId,
          senderId: userId,
          sender: {
            _id: userId,
            name: user.profile?.name || (user.role === 'admin' ? 'Admin' : 'Student'),
            photoUrl: user.profile?.photoUrl || '',
            iit: user.profile?.iit || '',
            role: user.role
          },
          text: msg.text,
          createdAt: msg.createdAt,
          seenBy: [userId]
        }

        // Acknowledge and update the sender even if room membership has not synced yet.
        ack({ success: true, message: messagePayload })
        socket.emit('message:new', messagePayload)
        socket.to(roomId).emit('message:new', messagePayload)
      } catch (error) {
        console.error('Message send failed:', error.message)
        ack({ success: false, message: 'Message could not be saved. Please try again.' })
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
          activeConversationByUser.delete(userId)
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
