import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/apiError.js'
import Conversation from '../models/Conversation.js'
import Message from '../models/Message.js'
import User from '../models/User.js'

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const participantFields = 'profile.name profile.iit profile.branch profile.batch profile.photoUrl lastSeenAt role'

async function withParticipants(conversation) {
  return Conversation.populate(conversation, {
    path: 'participants',
    select: participantFields
  })
}

export const listUsers = asyncHandler(async (req, res) => {
  const q = (req.query.q || '').toString().trim().slice(0, 80)
  const filter = {
    _id: { $ne: req.user._id },
    isBanned: false
  }

  if (q) {
    const safeQuery = escapeRegex(q)
    filter.$or = [
      { email: { $regex: safeQuery, $options: 'i' } },
      { 'profile.name': { $regex: safeQuery, $options: 'i' } },
      { 'profile.iit': { $regex: safeQuery, $options: 'i' } }
    ]
  }

  const users = await User.find(filter)
    .select('profile.name profile.iit profile.branch profile.photoUrl lastSeenAt')
    .limit(25)
    .sort({ createdAt: -1 })

  res.json({ success: true, users })
})

export const getOrCreateDM = asyncHandler(async (req, res) => {
  const { otherUserId } = req.body
  if (!otherUserId) throw new ApiError(400, 'otherUserId is required')

  const other = await User.findById(otherUserId)
  if (!other || other.isBanned) throw new ApiError(404, 'User not found')

  const me = req.user._id
  if (other._id.equals(me)) throw new ApiError(400, 'You cannot start a conversation with yourself')

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

  convo = await withParticipants(convo)
  res.json({ success: true, conversation: convo })
})

export const getOrCreateIitGroup = asyncHandler(async (req, res) => {
  const requestedIit = (req.body.iit || req.user.profile?.iit || '').trim()
  const profileIit = (req.user.profile?.iit || '').trim()
  if (!profileIit || requestedIit !== profileIit) {
    throw new ApiError(403, 'You can only join your own institute group')
  }
  const iit = profileIit

  let convo = await Conversation.findOne({ type: 'group', iit })
  if (!convo) {
    convo = await Conversation.create({
      type: 'group',
      iit,
      title: `${iit} Group`,
      participants: []
    })
  }

  if (!convo.participants.some((p) => p.toString() === req.user._id.toString())) {
    convo.participants.push(req.user._id)
    await convo.save()
  }

  convo = await withParticipants(convo)
  res.json({ success: true, conversation: convo })
})

export const getOrCreateCommunity = asyncHandler(async (req, res) => {
  let convo = await Conversation.findOne({ type: 'community' })
  if (!convo) {
    convo = await Conversation.create({
      type: 'community',
      title: 'IIT Community - All IITs',
      participants: []
    })
  }

  convo = await withParticipants(convo)
  res.json({ success: true, conversation: convo })
})

export const myConversations = asyncHandler(async (req, res) => {
  const userId = req.user._id
  const convos = await Conversation.find({
    $or: [{ participants: userId }, { type: 'group' }, { type: 'community' }]
  })
    .sort({ lastMessageAt: -1, updatedAt: -1 })
    .limit(50)
    .populate('participants', participantFields)

  res.json({ success: true, conversations: convos })
})

export const messages = asyncHandler(async (req, res) => {
  const { conversationId } = req.params
  const convo = await Conversation.findById(conversationId)
  if (!convo) throw new ApiError(404, 'Conversation not found')

  const isMember = convo.type === 'community' ||
    convo.participants.some((p) => p.toString() === req.user._id.toString())

  if (!isMember) throw new ApiError(403, 'Not a member')

  const msgs = await Message.find({ conversationId })
    .sort({ createdAt: 1 })
    .limit(500)
    .populate('senderId', 'profile.name profile.photoUrl profile.iit role')

  res.json({ success: true, messages: msgs })
})
