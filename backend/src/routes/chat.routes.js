
import { Router } from 'express'

import {
  requireAuth,
  requireCompletedProfile
} from '../middleware/auth.middleware.js'

import {
  listConnectionRequests,
  sendConnectionRequest,
  respondToConnectionRequest,
  sendMessage,
  getOrCreateDM,
  getOrCreateIitGroup,
  getOrCreateCommunity,
  listUsers,
  messages,
  myConversations
} from '../controllers/chat.controller.js'

const router = Router()

router.use(requireAuth, requireCompletedProfile)

router.get('/requests', requireAuth, listConnectionRequests)
router.post('/connect/:userId', requireAuth, sendConnectionRequest)
router.patch('/requests/:requestId', requireAuth, respondToConnectionRequest)
router.post('/messages', requireAuth, sendMessage)
router.get('/users', listUsers)
router.get('/conversations', myConversations)

router.post('/dm', getOrCreateDM)
router.post('/group', getOrCreateIitGroup)
router.post('/community', getOrCreateCommunity)

router.get('/messages/:conversationId', messages)

export default router
