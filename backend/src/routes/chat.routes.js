
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

router.get('/users', listUsers)
router.get('/conversations', myConversations)

router.post('/dm', getOrCreateDM)
router.post('/group', getOrCreateIitGroup)
router.post('/community', getOrCreateCommunity)

router.get('/messages/:conversationId', messages)

export default router
