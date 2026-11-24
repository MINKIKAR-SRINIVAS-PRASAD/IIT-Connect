import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/apiError.js'
import Conversation from '../models/Conversation.js'
import Message from '../models/Message.js'
import User from '../models/User.js'
import ConnectionRequest from '../models/ConnectionRequest.js'

export const listUsers = asyncHandler(async (req, res) => {
  const q = (req.query.q || '').toString().trim()
  const filter = q
    ? {
        $or: [
          { email: { $regex: q, $options: 'i' } },
          { 'profile.name': { $regex: q, $options: 'i' } },
          { 'profile.iit': { $regex: q, $options: 'i' } }
        ]
      }
    : {}

  const users = await User.find(filter)
    .select('email role profile isBanned lastSeenAt')
    .limit(25)
    .sort({ createdAt: -1 })

  res.json({ success: true, users })
})

export const getOrCreateDM = asyncHandler(async (req, res) => {
  const { otherUserId } = req.body
  if (!otherUserId) throw new ApiError(400, 'otherUserId is required')

  const other = await User.findById(otherUserId)
  if (!other) throw new ApiError(404, 'User not found')

  const me = req.user._id
  const accepted = await ConnectionRequest.exists({ status: 'accepted', $or: [{ requester: me, recipient: other._id }, { requester: other._id, recipient: me }] })
  if (!accepted) throw new ApiError(403, 'Send a connection request and wait for acceptance before messaging')

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

  res.json({ success: true, conversation: convo })
})

export const getOrCreateIitGroup = asyncHandler(async (req, res) => {
  const iit = (req.body.iit || req.user.profile?.iit || '').trim()
  if (!iit) throw new ApiError(400, 'IIT is required')

  let convo = await Conversation.findOne({ type: 'group', iit })
  if (!convo) {
    convo = await Conversation.create({
      type: 'group',
      iit,
      title: `${iit} Group`,
      participants: []
    })
  }

  // ensure membership
  if (!convo.participants.some((p) => p.toString() === req.user._id.toString())) {
    convo.participants.push(req.user._id)
    await convo.save()
  }

  res.json({ success: true, conversation: convo })
})

export const getOrCreateCommunity = asyncHandler(async (req, res) => {
  let convo = await Conversation.findOne({ type: 'community' })
  if (!convo) {
    convo = await Conversation.create({
      type: 'community',
      title: 'IIT Community - All IITs',
      participants: [] // no approval needed, open to all
    })
  }

  res.json({ success: true, conversation: convo })
})

export const myConversations = asyncHandler(async (req, res) => {
  const userId = req.user._id
  const acceptedRows = await ConnectionRequest.find({ status: 'accepted', $or: [{ requester: userId }, { recipient: userId }] }).select('requester recipient').lean()
  const acceptedIds = acceptedRows.map(row => String(row.requester) === String(userId) ? row.recipient : row.requester)
  const convos = await Conversation.find({
    $or: [{ type: 'dm', participants: { $all: [userId, { $in: acceptedIds }] } }, { participants: userId, type: { $ne: 'dm' } }, { type: 'group' }, { type: 'community' }]
  })
    .sort({ lastMessageAt: -1, updatedAt: -1 })
    .limit(50)

  res.json({ success: true, conversations: convos })
})

export const messages = asyncHandler(async (req, res) => {
  const { conversationId } = req.params
  const convo = await Conversation.findById(conversationId)
  if (!convo) throw new ApiError(404, 'Conversation not found')

  // dm: must be participant; group: allow if user is in participants; community: open to all
  const isMember = convo.type === 'community'
    ? true
    : convo.type === 'group'
    ? convo.participants.some((p) => p.toString() === req.user._id.toString())
    : convo.participants.some((p) => p.toString() === req.user._id.toString())

  if (!isMember) throw new ApiError(403, 'Not a member')
  if (convo.type === 'dm') { const otherId = convo.participants.find(p => p.toString() !== userId); const accepted = await ConnectionRequest.exists({ status: 'accepted', $or: [{ requester: req.user._id, recipient: otherId }, { requester: otherId, recipient: req.user._id }] }); if (!accepted) throw new ApiError(403, 'Connection is required to view private messages') }

  const msgs = await Message.find({ conversationId })
    .sort({ createdAt: 1 })
    .limit(500)

  res.json({ success: true, messages: msgs })
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
