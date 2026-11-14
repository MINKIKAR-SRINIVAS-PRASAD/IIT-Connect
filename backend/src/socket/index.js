
import { Server } from 'socket.io'
import jwt from 'jsonwebtoken'

import { env } from '../config/env.js'
import User from '../models/User.js'
import Conversation from '../models/Conversation.js'
import Message from '../models/Message.js'

const onlineUsers = new Map()

function parseCookie(cookieHeader = '') {
  const cookies = {}

  cookieHeader.split(';').forEach((part) => {
    const index = part.indexOf('=')

    if (index === -1) return

    const key = part.slice(0, index).trim()
    const value = part.slice(index + 1).trim()

    cookies[key] = decodeURIComponent(value)
  })

  return cookies
}

async function authFromHandshake(socket) {
  const cookies = parseCookie(
    socket.handshake.headers.cookie || ''
  )

  const token = cookies.accessToken

  if (!token) {
    throw new Error('Access token missing from socket handshake')
  }

  let payload

  try {
    payload = jwt.verify(token, env.JWT_ACCESS_SECRET)
  } catch {
    throw new Error('Invalid or expired socket token')
  }

  const user = await User.findById(payload.sub)
    .select('email role profile isBanned')

  if (!user || user.isBanned) {
    throw new Error('User not authorized')
  }

  return user
}

export function initSocket(httpServer, corsOrigin) {
  const io = new Server(httpServer, {
    cors: {
      origin: corsOrigin,
      credentials: true
    },
    transports: ['polling', 'websocket']
  })

  // Authenticate before connection
  io.use(async (socket, next) => {
    try {
      socket.user = await authFromHandshake(socket)
      next()
    } catch (error) {
      console.error(
        'Socket authentication failed:',
        error.message
      )

      next(new Error(error.message))
    }
  })

  io.on('connection', (socket) => {
    const user = socket.user
    const userId = user._id.toString()

    console.log('Socket connected:', user.email)

    onlineUsers.set(userId, socket.id)

    socket.broadcast.emit('presence:update', {
      userId,
      status: 'online'
    })

    socket.emit('presence:bootstrap', {
      onlineUserIds: Array.from(onlineUsers.keys())
    })

    // Join conversation
    socket.on('conversation:join', async ({ conversationId } = {}) => {
      try {
        if (!conversationId) return

        const convo = await Conversation.findById(conversationId)

        if (!convo) return

        const isMember =
          convo.type === 'community' ||
          convo.participants.some(
            (p) => p.toString() === userId
          )

        if (!isMember) return

        socket.join(conversationId)
      } catch (error) {
        console.error('Join conversation error:', error)
      }
    })

    // Typing
    socket.on('conversation:typing', ({ conversationId, isTyping } = {}) => {
      if (!conversationId) return

      socket.to(conversationId).emit('conversation:typing', {
        conversationId,
        userId,
        isTyping: Boolean(isTyping)
      })
    })

    // Send message
    socket.on('message:send', async ({ conversationId, text } = {}) => {
      try {
        if (!conversationId || !String(text || '').trim()) return

        const convo = await Conversation.findById(conversationId)

        if (!convo) return

        const isMember =
          convo.type === 'community' ||
          convo.participants.some(
            (p) => p.toString() === userId
          )

        if (!isMember) return

        const msg = await Message.create({
          conversationId,
          senderId: user._id,
          text: String(text).trim().slice(0, 2000),
          seenBy: [user._id]
        })

        convo.lastMessageAt = new Date()
        convo.lastMessageText = msg.text

        await convo.save()

        io.to(conversationId).emit('message:new', {
          _id: msg._id,
          conversationId,
          senderId: userId,
          senderName:
            user.profile?.name?.trim() ||
            user.email.split('@')[0] ||
            'Student',
          text: msg.text,
          createdAt: msg.createdAt,
          seenBy: msg.seenBy
        })

      } catch (error) {
        console.error('Message send error:', error)
      }
    })

    // Seen messages
    socket.on('message:seen', async ({ conversationId } = {}) => {
      try {
        if (!conversationId) return

        await Message.updateMany(
          { conversationId, seenBy: { $ne: user._id } },
          { $addToSet: { seenBy: user._id } }
        )

        socket.to(conversationId).emit('message:seen', {
          conversationId,
          userId
        })
      } catch (error) {
        console.error('Message seen error:', error)
      }
    })

    // Disconnect
    socket.on('disconnect', async () => {
      if (onlineUsers.get(userId) === socket.id) {
        onlineUsers.delete(userId)

        try {
          await User.updateOne(
            { _id: userId },
            { $set: { lastSeenAt: new Date() } }
          )
        } catch (error) {
          console.error('Last seen update error:', error)
        }

        socket.broadcast.emit('presence:update', {
          userId,
          status: 'offline'
        })
      }

      console.log('Socket disconnected:', user.email)
    })
  })

  return io
}
