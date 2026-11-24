import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { requireAuth } from '../middleware/auth.middleware.js'

const router = Router()

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Too many AI requests. Please wait a minute and try again.' }
})

router.post('/chat', requireAuth, aiLimiter, async (req, res, next) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY
    if (!apiKey) {
      return res.status(503).json({ message: 'AI is not configured yet. Add GEMINI_API_KEY to the backend environment.' })
    }

    const message = typeof req.body?.message === 'string' ? req.body.message.trim() : ''
    if (!message) return res.status(400).json({ message: 'Please enter a message.' })
    if (message.length > 6000) return res.status(400).json({ message: 'Message is too long (maximum 6000 characters).' })

    const history = Array.isArray(req.body?.history) ? req.body.history.slice(-12) : []
    const contents = history
      .filter(item => ['user', 'assistant', 'model'].includes(item?.role) && typeof item?.content === 'string')
      .map(item => ({
        role: item.role === 'assistant' || item.role === 'model' ? 'model' : 'user',
        parts: [{ text: item.content.slice(0, 6000) }]
      }))
    contents.push({ role: 'user', parts: [{ text: message }] })

    const requestBody = {
      systemInstruction: {
        parts: [{
          text: 'You are IIT Connect AI, a helpful assistant for students and faculty. Help with learning, engineering concepts, coding, research, teaching, campus guidance, and planning. Be clear, supportive, and honest. Do not invent official IIT policies or campus announcements; ask users to verify official information.'
        }]
      },
      contents,
      generationConfig: { temperature: 0.7, maxOutputTokens: 2048 }
    }

    const callGemini = async model => {
      const result = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': apiKey
          },
          body: JSON.stringify(requestBody)
        }
      )
      return { response: result, data: await result.json().catch(() => ({})) }
    }

    // Gemini 3.8 Flash can return 503 during capacity spikes. Try Google's
    // recommended efficient fallback model before returning an error to the UI.
    let { response, data } = await callGemini('gemini-3.8-flash')
    if (response.status === 503) {
      console.warn('[IIT Connect AI] Gemini 3.8 Flash overloaded (503); attempting gemini-3.5-flash-lite fallback.')
      const fallback = await callGemini('gemini-3.5-flash-lite')
      response = fallback.response
      data = fallback.data
      if (response.ok) {
        console.info('[IIT Connect AI] Fallback model gemini-3.5-flash-lite responded successfully.')
      }
    }

    if (!response.ok) {
      const upstreamMessage = data?.error?.message || 'The AI provider could not complete the request.'
      console.error(`[IIT Connect AI] Gemini HTTP ${response.status} (${data?.error?.status || 'unknown'}): ${upstreamMessage}`)
      const status = response.status === 429 ? 429 : response.status === 401 || response.status === 403 ? 503 : 502
      return res.status(status).json({
        message: response.status === 429
          ? 'Gemini request limit reached. Please wait and try again.'
          : status === 503
            ? 'The AI provider rejected the configured API key. Check the Gemini key in Render.'
            : 'The AI service is temporarily unavailable. Please try again.'
      })
    }

    const answer = data?.candidates?.[0]?.content?.parts
      ?.map(part => part.text || '')
      .join('')
      .trim()

    if (!answer) return res.status(502).json({ message: 'The AI returned an empty response. Please try again.' })
    return res.json({ answer })
  } catch (error) {
    return next(error)
  }
})

export default router
