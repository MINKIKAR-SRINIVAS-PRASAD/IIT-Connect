import { Server } from 'socket.io'
import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import User from '../models/User.js'
import Conversation from '../models/Conversation.js'
import Message from '../models/Message.js'
import ConnectionRequest from '../models/ConnectionRequest.js'

const onlineUsers = new Map() // userId -> socketId

function parseCookie(cookieHeader = '') {
  const out = {}
  cookieHeader.split(';').forEach((part) => {
    const [k, ...v] = part.trim().split('=')
    if (!k) return
    out[k] = decodeURIComponent(v.join('='))
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

export function initSocket(httpServer, corsOrigin) {
  const io = new Server(httpServer, {
    cors: {
      origin: corsOrigin,
      credentials: true
    }
  })

  io.on('connection', async (socket) => {
    const user = await authFromHandshake(socket)
    if (!user) {
      socket.disconnect(true)
      return
    }

    const userId = user._id.toString()
    onlineUsers.set(userId, socket.id)

    socket.broadcast.emit('presence:update', { userId, status: 'online' })

    socket.on('conversation:join', async ({ conversationId }) => {
      if (!conversationId) return
      const convo = await Conversation.findById(conversationId)
      if (!convo) return
      if (convo.type === 'dm') {
        if (!convo.participants.some(p => p.toString() === userId)) return
        const otherId = convo.participants.find(p => p.toString() !== userId)
        const connected = await ConnectionRequest.exists({ status: 'accepted', $or: [{ requester: user._id, recipient: otherId }, { requester: otherId, recipient: user._id }] })
        if (!connected) return
      } else if (convo.type === 'group' && !convo.participants.some(p => p.toString() === userId)) return
      socket.join(conversationId) // socket join requires accepted connection
    })

    socket.on('conversation:typing', ({ conversationId, isTyping }) => {
      if (!conversationId) return
      socket.to(conversationId).emit('conversation:typing', { conversationId, userId, isTyping: !!isTyping })
    })

    socket.on('message:send', async ({ conversationId, text }) => {
      if (!conversationId || (!text || !String(text).trim())) return

      const convo = await Conversation.findById(conversationId)
      if (!convo) return

      // Community type is open to all; others require membership
      const isMember = convo.type === 'community' || convo.participants.some((p) => p.toString() === userId)
      if (!isMember) return

      const msg = await Message.create({
        conversationId,
        senderId: user._id,
        text: String(text).slice(0, 2000),
        seenBy: [user._id]
      })

      convo.lastMessageAt = new Date()
      convo.lastMessageText = msg.text
      await convo.save()

      io.to(conversationId).emit('message:new', {
        _id: msg._id,
        conversationId,
        senderId: user._id,
        text: msg.text,
        createdAt: msg.createdAt,
        seenBy: msg.seenBy
      })
    })

    socket.on('message:seen', async ({ conversationId }) => {
      if (!conversationId) return
      await Message.updateMany(
        { conversationId, seenBy: { $ne: user._id } },
        { $push: { seenBy: user._id } }
      )
      socket.to(conversationId).emit('message:seen', { conversationId, userId })
    })

    socket.on('disconnect', async () => {
      onlineUsers.delete(userId)
      try {
        await User.updateOne({ _id: userId }, { $set: { lastSeenAt: new Date() } })
      } catch {
        // ignore
      }
      socket.broadcast.emit('presence:update', { userId, status: 'offline' })
    })

    socket.emit('presence:bootstrap', {
      onlineUserIds: Array.from(onlineUsers.keys())
    })
  })

  return io
}
