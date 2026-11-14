import { Router } from 'express'
import { requireAuth } from '../middleware/auth.middleware.js'
import { requireProfileComplete } from '../middleware/profileCompletion.middleware.js'
import { getOrCreateDM, getOrCreateIitGroup, getOrCreateCommunity, listUsers, messages, myConversations } from '../controllers/chat.controller.js'

const router = Router()

router.use(requireAuth, requireProfileComplete)

router.get('/users', listUsers)
router.get('/conversations', myConversations)
router.post('/dm', getOrCreateDM)
router.post('/group', getOrCreateIitGroup)
router.post('/community', getOrCreateCommunity)
router.get('/messages/:conversationId', messages)

export default router
