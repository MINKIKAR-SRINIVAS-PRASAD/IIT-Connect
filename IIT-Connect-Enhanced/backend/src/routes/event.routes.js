import { Router } from 'express'
import { requireAuth, optionalAuth } from '../middleware/auth.middleware.js'
import { requireProfileComplete } from '../middleware/profileCompletion.middleware.js'
import { upload } from '../middleware/upload.middleware.js'
import { validateImageUpload } from '../middleware/imageUpload.middleware.js'
import { createEvent, listApprovedEvents, myEvents } from '../controllers/event.controller.js'

const router = Router()

// Approved campus events are shared across student and faculty workspaces.
router.get('/', optionalAuth, listApprovedEvents)
router.get('/mine', requireAuth, myEvents)
router.post('/', requireAuth, requireProfileComplete, upload.single('poster'), validateImageUpload, createEvent)

export default router
