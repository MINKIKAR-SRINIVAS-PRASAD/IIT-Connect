import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { requireAuth } from '../middleware/auth.middleware.js'
import AIConversation from '../models/AIConversation.js'

const router = Router()
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Too many AI requests. Please wait a minute and try again.' }
})
const titleFromMessage = value => {
  const clean = String(value || '').replace(/\s+/g, ' ').trim()
  return clean.length > 64 ? `${clean.slice(0, 61)}…` : clean || 'New chat'
}

router.use(requireAuth)
router.use((req, res, next) => {
  if (req.user.role === 'faculty' && !req.user.facultyVerified) {
    return res.status(403).json({ message: 'Faculty verification is required to use IIT Connect AI.' })
  }
  next()
})

router.get('/conversations', async (req, res, next) => {
  try {
    const conversations = await AIConversation.find({ owner: req.user._id })
      .sort({ updatedAt: -1 }).limit(100)
      .select('title createdAt updatedAt lastMessageAt messages').lean()
    res.json({ conversations: conversations.map(c => ({
      id: String(c._id), title: c.title || 'New chat',
      createdAt: c.createdAt, updatedAt: c.updatedAt, lastMessageAt: c.lastMessageAt,
      preview: c.messages?.length ? c.messages[c.messages.length - 1].content.slice(0, 100) : ''
    })) })
  } catch (error) { next(error) }
})

router.post('/conversations', async (req, res, next) => {
  try {
    const title = String(req.body?.title || 'New chat').trim().slice(0, 120) || 'New chat'
    const c = await AIConversation.create({ owner: req.user._id, title })
    res.status(201).json({ conversation: { id: String(c._id), title: c.title, createdAt: c.createdAt, updatedAt: c.updatedAt, messages: [] } })
  } catch (error) { next(error) }
})

router.get('/conversations/:id', async (req, res, next) => {
  try {
    const c = await AIConversation.findOne({ _id: req.params.id, owner: req.user._id }).lean()
    if (!c) return res.status(404).json({ message: 'Conversation not found.' })
    res.json({ conversation: { id: String(c._id), title: c.title, createdAt: c.createdAt, updatedAt: c.updatedAt, messages: (c.messages || []).map(m => ({ id: String(m._id), role: m.role, content: m.content, status: m.status, createdAt: m.createdAt })) } })
  } catch (error) { next(error) }
})

router.patch('/conversations/:id', async (req, res, next) => {
  try {
    const title = String(req.body?.title || '').trim().slice(0, 120)
    if (!title) return res.status(400).json({ message: 'A conversation title is required.' })
    const c = await AIConversation.findOneAndUpdate({ _id: req.params.id, owner: req.user._id }, { $set: { title } }, { new: true, runValidators: true }).select('title updatedAt')
    if (!c) return res.status(404).json({ message: 'Conversation not found.' })
    res.json({ conversation: { id: String(c._id), title: c.title, updatedAt: c.updatedAt } })
  } catch (error) { next(error) }
})

router.delete('/conversations/:id', async (req, res, next) => {
  try {
    const result = await AIConversation.deleteOne({ _id: req.params.id, owner: req.user._id })
    if (!result.deletedCount) return res.status(404).json({ message: 'Conversation not found.' })
    res.json({ success: true })
  } catch (error) { next(error) }
})

router.post('/chat', aiLimiter, async (req, res, next) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY
    if (!apiKey) return res.status(503).json({ message: 'AI is not configured yet. Add GEMINI_API_KEY to the backend environment.' })

    const message = typeof req.body?.message === 'string' ? req.body.message.trim() : ''
    if (!message) return res.status(400).json({ message: 'Please enter a message.' })
    if (message.length > 6000) return res.status(400).json({ message: 'Message is too long (maximum 6000 characters).' })

    let conversation
    if (req.body?.conversationId) {
      conversation = await AIConversation.findOne({ _id: req.body.conversationId, owner: req.user._id })
      if (!conversation) return res.status(404).json({ message: 'Conversation not found.' })
    } else {
      conversation = await AIConversation.create({ owner: req.user._id, title: titleFromMessage(message) })
    }
    if (!conversation.messages.length || conversation.title === 'New chat') conversation.title = titleFromMessage(message)

    const userMessage = conversation.messages.create({ role: 'user', content: message, status: 'pending' })
    conversation.messages.push(userMessage)
    conversation.lastMessageAt = new Date()
    if (conversation.messages.length > 250) conversation.messages.splice(0, conversation.messages.length - 250)
    await conversation.save()

    const history = conversation.messages
      .filter(item => item.status === 'complete' && ['user', 'assistant'].includes(item.role))
      .slice(-16)
      .map(item => ({ role: item.role === 'assistant' ? 'model' : 'user', parts: [{ text: item.content.slice(0, 6000) }] }))
    history.push({ role: 'user', parts: [{ text: message }] })

    const requestBody = {
      systemInstruction: { parts: [{ text: 'You are IIT Connect AI, a helpful assistant for students and faculty. Help with learning, engineering concepts, coding, research, teaching, campus guidance, and planning. Be clear, supportive, and honest. Do not invent official IIT policies or campus announcements; ask users to verify official information.' }] },
      contents: history,
      generationConfig: { temperature: 0.7, maxOutputTokens: 2048 }
    }

    const callGemini = async model => {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
        body: JSON.stringify(requestBody)
      })
      return { response, data: await response.json().catch(() => ({})) }
    }

    let { response, data } = await callGemini('gemini-3.8-flash')
    if (response.status === 503) {
      console.warn('[IIT Connect AI] Gemini Flash overloaded; trying Flash Lite fallback.')
      const fallback = await callGemini('gemini-3.5-flash-lite')
      response = fallback.response
      data = fallback.data
    }

    if (!response.ok) {
      userMessage.status = 'failed'
      await conversation.save()
      const upstream = data?.error?.message || 'Provider error'
      console.error(`[IIT Connect AI] Gemini HTTP ${response.status}: ${upstream}`)
      const status = response.status === 429 ? 429 : response.status === 401 || response.status === 403 ? 503 : 502
      return res.status(status).json({
        conversationId: String(conversation._id),
        message: response.status === 429 ? 'Gemini request limit reached. Please wait and try again.' : status === 503 ? 'The AI provider rejected the configured API key. Check the Gemini key in Render.' : 'The AI service is temporarily unavailable. Please try again.'
      })
    }

    const answer = data?.candidates?.[0]?.content?.parts?.map(part => part.text || '').join('').trim()
    if (!answer) {
      userMessage.status = 'failed'
      await conversation.save()
      return res.status(502).json({ conversationId: String(conversation._id), message: 'The AI returned an empty response. Please try again.' })
    }

    userMessage.status = 'complete'
    conversation.messages.push({ role: 'assistant', content: answer, status: 'complete' })
    conversation.lastMessageAt = new Date()
    await conversation.save()
    return res.json({ answer, conversationId: String(conversation._id), title: conversation.title })
  } catch (error) { next(error) }
})

export default router
