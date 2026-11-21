
import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/apiError.js'

import Conversation from '../models/Conversation.js'
import Message from '../models/Message.js'
import User from '../models/User.js'

// 1. List students and users
export const listUsers = asyncHandler(async (req, res) => {
  const q = String(req.query.q || '').trim()

  const filter = q
    ? {
        $or: [
          { email: { $regex: q, $options: 'i' } },
          { 'profile.name': { $regex: q, $options: 'i' } },
          { 'profile.rollNumber': { $regex: q, $options: 'i' } },
          { 'profile.iit': { $regex: q, $options: 'i' } }
        ]
      }
    : {}

  const users = await User.find({
    ...filter,
    _id: { $ne: req.user._id },
    isBanned: { $ne: true }
  })
    .select('email role profile isBanned lastSeenAt')
    .limit(25)
    .sort({ createdAt: -1 })
    .lean()

  const formattedUsers = users.map(user => ({
    ...user,
    name:
      user.profile?.name?.trim() ||
      user.name ||
      user.email?.split('@')[0] ||
      'Student'
  }))

  res.json({
    success: true,
    users: formattedUsers
  })
})

// 2. Create or get direct message
export const getOrCreateDM = asyncHandler(async (req, res) => {
  const { otherUserId } = req.body

  if (!otherUserId) {
    throw new ApiError(400, 'otherUserId is required')
  }

  if (otherUserId.toString() === req.user._id.toString()) {
    throw new ApiError(400, 'Cannot create a DM with yourself')
  }

  const other = await User.findById(otherUserId)

  if (!other || other.isBanned) {
    throw new ApiError(404, 'User not found')
  }

  const me = req.user._id

  let convo = await Conversation.findOne({
    type: 'dm',
    participants: { $all: [me, other._id] }
  })

  if (!convo) {
    convo = await Conversation.create({
      type: 'dm',
      participants: [me, other._id]
    })
  }

  res.json({
    success: true,
    conversation: convo
  })
})

// 3. Create or join IIT group
export const getOrCreateIitGroup = asyncHandler(async (req, res) => {
  const iit = String(
    req.body.iit || req.user.profile?.iit || ''
  ).trim()

  if (!iit) {
    throw new ApiError(400, 'IIT is required')
  }

  let convo = await Conversation.findOne({
    type: 'group',
    iit
  })

  if (!convo) {
    convo = await Conversation.create({
      type: 'group',
      iit,
      title: `${iit} Group`,
      participants: []
    })
  }

  const isMember = convo.participants.some(
    p => p.toString() === req.user._id.toString()
  )

  if (!isMember) {
    convo.participants.push(req.user._id)
    await convo.save()
  }

  res.json({
    success: true,
    conversation: convo
  })
})

// 4. Create or get all-IIT community
export const getOrCreateCommunity = asyncHandler(async (req, res) => {
  let convo = await Conversation.findOne({
    type: 'community'
  })

  if (!convo) {
    convo = await Conversation.create({
      type: 'community',
      title: 'IIT Community - All IITs',
      participants: []
    })
  }

  res.json({
    success: true,
    conversation: convo
  })
})

// 5. Get user's conversations

export const myConversations = asyncHandler(async (req, res) => {
  const userId = req.user._id

  const conversations = await Conversation.find({
    $or: [
      { participants: userId },
      { type: 'group' },
      { type: 'community' }
    ]
  })
    .populate({
      path: 'participants',
      select: 'email role profile isBanned'
    })
    .sort({
      lastMessageAt: -1,
      updatedAt: -1
    })
    .limit(50)
    .lean()

  const formattedConversations = conversations.map((conversation) => {
    let displayName = conversation.title || ''

    if (conversation.type === 'dm') {
      const otherUser = (conversation.participants || []).find(
        (participant) =>
          String(participant._id) !== String(userId)
      )

      displayName =
        otherUser?.profile?.name?.trim() ||
        otherUser?.email?.split('@')[0] ||
        'Unknown Student'
    }

    if (conversation.type === 'group') {
      displayName =
        conversation.title ||
        `${conversation.iit || 'IIT'} Group`
    }

    if (conversation.type === 'community') {
      displayName =
        conversation.title ||
        'IIT Community'
    }

    return {
      ...conversation,
      displayName
    }
  })

  res.json({
    success: true,
    conversations: formattedConversations
  })
})


// 6. Get messages with student names
export const messages = asyncHandler(async (req, res) => {
  const { conversationId } = req.params

  const convo = await Conversation.findById(conversationId)

  if (!convo) {
    throw new ApiError(404, 'Conversation not found')
  }

  const userId = req.user._id.toString()

  const isMember =
    convo.type === 'community' ||
    convo.participants.some(
      p => p.toString() === userId
    )

  if (!isMember) {
    throw new ApiError(403, 'Not a member')
  }

  const msgs = await Message.find({ conversationId })
    .populate({
      path: 'senderId',
      select: 'email profile role'
    })
    .sort({ createdAt: 1 })
    .limit(500)
    .lean()

  const formattedMessages = msgs.map(msg => {
    const sender = msg.senderId

    return {
      ...msg,

      senderId: sender?._id?.toString() || null,

      senderName:
        sender?.profile?.name?.trim() ||
        sender?.email?.split('@')[0] ||
        'Student'
    }
  })

  res.json({
    success: true,
    messages: formattedMessages
  })
})
