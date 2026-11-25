import { Router } from 'express'
import { requireAuth, optionalAuth } from '../middleware/auth.middleware.js'
import { upload } from '../middleware/upload.middleware.js'
import { createEvent, listApprovedEvents, myEvents } from '../controllers/event.controller.js'

const router = Router()

router.get('/', optionalAuth, listApprovedEvents)
router.get('/mine', requireAuth, myEvents)
router.post('/', requireAuth, upload.single('poster'), createEvent)

export default router
