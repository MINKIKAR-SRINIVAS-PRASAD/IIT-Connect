import { Router } from 'express'
import { requireAuth } from '../middleware/auth.middleware.js'
import { listConnectionRequests, sendConnectionRequest, respondToConnectionRequest, sendMessage, getOrCreateDM, getOrCreateIitGroup, getOrCreateCommunity, listUsers, messages, myConversations } from '../controllers/chat.controller.js'

const router = Router()

router.get('/requests', requireAuth, listConnectionRequests)\nrouter.post('/connect/:userId', requireAuth, sendConnectionRequest)\nrouter.patch('/requests/:requestId', requireAuth, respondToConnectionRequest)\nrouter.post('/messages', requireAuth, sendMessage)\nrouter.get('/users', requireAuth, listUsers)
router.get('/conversations', requireAuth, myConversations)
router.post('/dm', requireAuth, getOrCreateDM)
router.post('/group', requireAuth, getOrCreateIitGroup)
router.post('/community', requireAuth, getOrCreateCommunity)
router.get('/messages/:conversationId', requireAuth, messages)

export default router
