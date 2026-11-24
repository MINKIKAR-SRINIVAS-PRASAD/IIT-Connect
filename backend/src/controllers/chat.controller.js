
import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/apiError.js'

import Conversation from '../models/Conversation.js'
import Message from '../models/Message.js'
import User from '../models/User.js'\nimport ConnectionRequest from '../models/ConnectionRequest.js'

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


// Connection requests: private DMs are available only after acceptance.
export const listConnectionRequests = asyncHandler(async (req, res) => {
  const uid = req.user._id
  const [incoming, outgoing, connections] = await Promise.all([
    ConnectionRequest.find({ recipient: uid, status: 'pending' }).populate('requester', 'email role profile').sort({ createdAt: -1 }).lean(),
    ConnectionRequest.find({ requester: uid, status: 'pending' }).populate('recipient', 'email role profile').sort({ createdAt: -1 }).lean(),
    ConnectionRequest.find({ $or: [{ requester: uid }, { recipient: uid }], status: 'accepted' }).populate('requester recipient', 'email role profile').lean()
  ])
  res.json({ success: true, incoming, outgoing, connections: connections.map(row => ({
    _id: row._id,
    user: String(row.requester?._id) === String(uid) ? row.recipient : row.requester,
    acceptedAt: row.respondedAt
  })) })
})

export const sendConnectionRequest = asyncHandler(async (req, res) => {
  const targetId = req.params.userId
  if (!targetId || String(targetId) === String(req.user._id)) throw new ApiError(400, 'Choose another student')
  const target = await User.findById(targetId).select('_id isBanned role')
  if (!target || target.isBanned || target.role === 'admin') throw new ApiError(404, 'Student not found')
  const uid = req.user._id
  const reciprocal = await ConnectionRequest.findOne({ requester: target._id, recipient: uid, status: 'pending' })
  if (reciprocal) {
    reciprocal.status = 'accepted'; reciprocal.respondedAt = new Date(); await reciprocal.save()
    return res.json({ success: true, status: 'accepted', request: reciprocal })
  }
  let request = await ConnectionRequest.findOne({ requester: uid, recipient: target._id })
  if (request?.status === 'accepted') return res.json({ success: true, status: 'accepted', request })
  if (request?.status === 'pending') return res.json({ success: true, status: 'pending', request })
  if (request) { request.status = 'pending'; request.respondedAt = null; await request.save() }
  else request = await ConnectionRequest.create({ requester: uid, recipient: target._id, status: 'pending' })
  res.status(201).json({ success: true, status: 'pending', request })
})

export const respondToConnectionRequest = asyncHandler(async (req, res) => {
  const { action } = req.body
  if (!['accept', 'reject'].includes(action)) throw new ApiError(400, 'Choose accept or reject')
  const request = await ConnectionRequest.findOne({ _id: req.params.requestId, recipient: req.user._id, status: 'pending' })
  if (!request) throw new ApiError(404, 'Pending request not found')
  request.status = action === 'accept' ? 'accepted' : 'rejected'
  request.respondedAt = new Date()
  await request.save()
  res.json({ success: true, status: request.status, request })
})

export const sendMessage = asyncHandler(async (req, res) => {
  const { conversationId, text } = req.body
  const cleanText = String(text || '').trim()
  if (!conversationId || !cleanText) throw new ApiError(400, 'Conversation and message are required')
  const convo = await Conversation.findById(conversationId)
  if (!convo) throw new ApiError(404, 'Conversation not found')
  const uid = String(req.user._id)
  const member = convo.participants.some(p => String(p) === uid)
  if (convo.type === 'dm') {
    if (!member || convo.participants.length !== 2) throw new ApiError(403, 'You are not part of this chat')
    const otherId = convo.participants.find(p => String(p) !== uid)
    const connected = await ConnectionRequest.exists({ status: 'accepted', $or: [
      { requester: req.user._id, recipient: otherId }, { requester: otherId, recipient: req.user._id }
    ] })
    if (!connected) throw new ApiError(403, 'Accept the connection request before messaging')
  } else if (convo.type === 'group' && !member) throw new ApiError(403, 'Join this group to message')
  const message = await Message.create({ conversationId, senderId: req.user._id, text: cleanText.slice(0, 2000), seenBy: [req.user._id] })
  convo.lastMessageAt = new Date(); convo.lastMessageText = message.text; await convo.save()
  const populated = await Message.findById(message._id).populate('senderId', 'email role profile').lean()
  res.status(201).json({ success: true, message: populated })
})
