
import { Router } from 'express'
import {
  requireAuth,
  requireCompletedProfile
} from '../middleware/auth.middleware.js'

import { upload } from '../middleware/upload.middleware.js'

import {
  createEvent,
  listApprovedEvents,
  myEvents
} from '../controllers/event.controller.js'

const router = Router()

router.use(requireAuth, requireCompletedProfile)

router.get('/', listApprovedEvents)
router.get('/mine', myEvents)
router.post('/', upload.single('poster'), createEvent)

export default router
