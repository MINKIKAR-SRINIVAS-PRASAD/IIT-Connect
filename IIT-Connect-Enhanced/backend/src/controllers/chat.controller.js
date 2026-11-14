import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/apiError.js'
import Conversation from '../models/Conversation.js'
import Message from '../models/Message.js'
import User from '../models/User.js'

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
  const convos = await Conversation.find({
    $or: [{ participants: userId }, { type: 'group' }, { type: 'community' }]
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

  const msgs = await Message.find({ conversationId })
    .sort({ createdAt: 1 })
    .limit(500)

  res.json({ success: true, messages: msgs })
})
