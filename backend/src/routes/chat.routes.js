
import { Router } from 'express'

import {
  requireAuth,
  requireCompletedProfile
} from '../middleware/auth.middleware.js'

import {
  getOrCreateDM,
  getOrCreateIitGroup,
  getOrCreateCommunity,
  listUsers,
  messages,
  myConversations
} from '../controllers/chat.controller.js'

const router = Router()

router.use(requireAuth, requireCompletedProfile)

router.get('/requests', requireAuth, listConnectionRequests)\nrouter.post('/connect/:userId', requireAuth, sendConnectionRequest)\nrouter.patch('/requests/:requestId', requireAuth, respondToConnectionRequest)\nrouter.post('/messages', requireAuth, sendMessage)\nrouter.get('/users', listUsers)
router.get('/conversations', myConversations)

router.post('/dm', getOrCreateDM)
router.post('/group', getOrCreateIitGroup)
router.post('/community', getOrCreateCommunity)

router.get('/messages/:conversationId', messages)

export default router
