import { Router } from 'express'
import { requireAuth } from '../middleware/auth.middleware.js'
import { listConnectionRequests, sendConnectionRequest, respondToConnectionRequest, sendMessage, getOrCreateDM, getOrCreateIitGroup, getOrCreateCommunity, listUsers, messages, myConversations, listConversationMembers } from '../controllers/chat.controller.js'

const router = Router()

router.get('/requests', requireAuth, listConnectionRequests)
router.post('/connect/:userId', requireAuth, sendConnectionRequest)
router.patch('/requests/:requestId', requireAuth, respondToConnectionRequest)
router.post('/messages', requireAuth, sendMessage)
router.get('/users', requireAuth, listUsers)
router.get('/conversations', requireAuth, myConversations)
router.get('/members/:conversationId', requireAuth, listConversationMembers)
router.post('/dm', requireAuth, getOrCreateDM)
router.post('/group', requireAuth, getOrCreateIitGroup)
router.post('/community', requireAuth, getOrCreateCommunity)
router.get('/messages/:conversationId', requireAuth, messages)

export default router
