import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/apiError.js'
import Conversation from '../models/Conversation.js'
import Message from '../models/Message.js'
import User from '../models/User.js'
import ConversationPreference from '../models/ConversationPreference.js'
import { removeUserFromConversation, broadcastMessageToConversation, isUserViewingConversation } from '../socket/index.js'
import { sendPushToUser } from '../services/pushNotifications.js'

function isConversationMember(conversation, userId) {
  return Boolean(conversation?.participants?.some((participant) => participant.toString() === userId.toString()))
}

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const participantFields = 'profile.name profile.rollNumber profile.iit profile.branch profile.batch profile.photoUrl lastSeenAt role'

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
    role: 'student',
    isBanned: false
  }

  if (q) {
    const safeQuery = escapeRegex(q)
    filter.$or = [
      { email: { $regex: safeQuery, $options: 'i' } },
      { 'profile.name': { $regex: safeQuery, $options: 'i' } },
      { 'profile.rollNumber': { $regex: safeQuery, $options: 'i' } },
      { 'profile.iit': { $regex: safeQuery, $options: 'i' } }
    ]
  }

  const users = await User.find(filter)
    .select('profile.name profile.rollNumber profile.iit profile.branch profile.photoUrl lastSeenAt')
    .limit(q ? 0 : 25)
    .sort({ createdAt: -1 })

  res.json({ success: true, users })
})

export const getOrCreateDM = asyncHandler(async (req, res) => {
  const { otherUserId } = req.body
  if (!otherUserId) throw new ApiError(400, 'otherUserId is required')

  const other = await User.findById(otherUserId)
  if (!other || other.isBanned || other.role !== 'student' || req.user.role !== 'student') throw new ApiError(404, 'Student community user not found')

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
  const title = 'Indian IIT Students Community'
  let convo = await Conversation.findOne({ type: 'community' })

  if (!convo) {
    convo = await Conversation.create({
      type: 'community',
      title,
      participants: [req.user._id]
    })
  } else {
    convo.title = title
    const alreadyJoined = convo.participants.some(
      (participant) => participant.toString() === req.user._id.toString()
    )
    if (!alreadyJoined) convo.participants.push(req.user._id)
    await convo.save()
  }

  convo = await withParticipants(convo)
  res.json({ success: true, conversation: convo })
})

export const myConversations = asyncHandler(async (req, res) => {
  const userId = req.user._id
  const convos = await Conversation.find({ participants: userId })
    .sort({ lastMessageAt: -1, updatedAt: -1 })
    .limit(100)
    .populate('participants', participantFields)
    .lean()

  const preferences = await ConversationPreference.find({
    userId,
    conversationId: { $in: convos.map((conversation) => conversation._id) }
  }).lean()
  const preferenceByConversation = new Map(preferences.map((preference) => [
    preference.conversationId.toString(),
    { pinned: preference.pinned, muted: preference.muted, archived: preference.archived }
  ]))
  const withPreferences = convos.map((conversation) => ({
    ...conversation,
    preferences: preferenceByConversation.get(conversation._id.toString()) || { pinned: false, muted: false, archived: false }
  })).filter((conversation) => req.query.includeArchived === 'true' || !conversation.preferences.archived)
    .filter((conversation) => !(conversation.type === 'dm' && conversation.participants.some((participant) => participant?.role === 'admin')))
    .sort((a, b) => Number(b.preferences.pinned) - Number(a.preferences.pinned)
      || new Date(b.lastMessageAt || b.updatedAt) - new Date(a.lastMessageAt || a.updatedAt))

  res.json({ success: true, conversations: withPreferences })
})

export const updateConversationPreferences = asyncHandler(async (req, res) => {
  const { conversationId } = req.params
  const allowed = ['pinned', 'muted', 'archived']
  const updates = {}
  for (const key of allowed) {
    if (Object.prototype.hasOwnProperty.call(req.body || {}, key)) {
      if (typeof req.body[key] !== 'boolean') throw new ApiError(400, `${key} must be a boolean`)
      updates[key] = req.body[key]
    }
  }
  if (!Object.keys(updates).length) throw new ApiError(400, 'Provide at least one preference to update')

  const conversation = await Conversation.findById(conversationId)
  if (!conversation) throw new ApiError(404, 'Conversation not found')
  if (!isConversationMember(conversation, req.user._id)) throw new ApiError(403, 'Not a member of this conversation')

  const preference = await ConversationPreference.findOneAndUpdate(
    { userId: req.user._id, conversationId },
    { $set: updates, $setOnInsert: { userId: req.user._id, conversationId } },
    { new: true, upsert: true, runValidators: true }
  )
  res.json({ success: true, preferences: {
    pinned: preference.pinned, muted: preference.muted, archived: preference.archived
  } })
})

export const leaveConversation = asyncHandler(async (req, res) => {
  const { conversationId } = req.params
  const conversation = await Conversation.findById(conversationId)
  if (!conversation) throw new ApiError(404, 'Conversation not found')
  if (conversation.type === 'dm') throw new ApiError(400, 'Direct messages cannot be left; archive the conversation instead')
  if (!isConversationMember(conversation, req.user._id)) throw new ApiError(403, 'Not a member of this conversation')

  conversation.participants = conversation.participants.filter(
    (participant) => participant.toString() !== req.user._id.toString()
  )
  await conversation.save()
  await ConversationPreference.deleteOne({ userId: req.user._id, conversationId })
  removeUserFromConversation(req.user._id.toString(), conversationId)
  res.json({ success: true, message: 'You left the group' })
})

export const sendMessage = asyncHandler(async (req, res) => {
  const { conversationId, text } = req.body || {}
  if (typeof conversationId !== 'string' || !conversationId) throw new ApiError(400, 'conversationId is required')
  if (typeof text !== 'string') throw new ApiError(400, 'Message text is invalid')
  const cleanText = text.trim()
  if (!cleanText || cleanText.length > 2000) throw new ApiError(400, 'Message must contain 1–2000 characters')

  const conversation = await Conversation.findById(conversationId)
  if (!conversation) throw new ApiError(404, 'Conversation not found')
  if (!isConversationMember(conversation, req.user._id)) throw new ApiError(403, 'Not a member of this conversation')

  const message = await Message.create({
    conversationId: conversation._id,
    senderId: req.user._id,
    text: cleanText,
    seenBy: [req.user._id]
  })
  conversation.lastMessageAt = message.createdAt || new Date()
  conversation.lastMessageText = cleanText
  await conversation.save()

  const payload = {
    _id: message._id.toString(),
    conversationId: conversation._id.toString(),
    senderId: req.user._id.toString(),
    sender: {
      _id: req.user._id.toString(),
      name: req.user.profile?.name || (req.user.role === 'admin' ? 'Admin' : 'Student'),
      photoUrl: req.user.profile?.photoUrl || '',
      iit: req.user.profile?.iit || '',
      role: req.user.role
    },
    text: cleanText,
    createdAt: message.createdAt,
    seenBy: [req.user._id.toString()]
  }

  // HTTP confirms persistence; Socket.IO only distributes the saved event to active members.
  broadcastMessageToConversation(conversation._id.toString(), payload)
  // Notify only recipients who are not actively viewing this conversation.
  const recipientIds = conversation.participants
    .map((participant) => participant.toString())
    .filter((participantId) => participantId !== req.user._id.toString())
  const recipientPreferences = await ConversationPreference.find({
    userId: { $in: recipientIds },
    conversationId: conversation._id,
    muted: true
  }).select('userId').lean()
  const mutedUsers = new Set(recipientPreferences.map((item) => item.userId.toString()))
  const senderName = req.user.profile?.name || (req.user.role === 'admin' ? 'Admin' : 'A student')
  await Promise.all(recipientIds.map(async (recipientId) => {
    if (mutedUsers.has(recipientId) || isUserViewingConversation(recipientId, conversation._id.toString())) return
    await sendPushToUser(recipientId, {
      title: senderName,
      body: conversation.type === 'dm' ? 'Sent you a message' : `New message in ${conversation.title || 'your group'}`,
      tag: `chat-${conversation._id.toString()}`,
      url: '/app/chat'
    })
  }))

  res.status(201).json({ success: true, message: payload })
})

export const messages = asyncHandler(async (req, res) => {
  const { conversationId } = req.params
  const convo = await Conversation.findById(conversationId)
  if (!convo) throw new ApiError(404, 'Conversation not found')

  const isMember = convo.participants.some((p) => p.toString() === req.user._id.toString())

  if (!isMember) throw new ApiError(403, 'Not a member')

  const msgs = await Message.find({ conversationId })
    .sort({ createdAt: 1 })
    .limit(500)
    .populate('senderId', 'profile.name profile.photoUrl profile.iit role')

  res.json({ success: true, messages: msgs })
})
