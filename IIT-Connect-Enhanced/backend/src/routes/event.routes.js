import { Router } from 'express'
import { requireAuth } from '../middleware/auth.middleware.js'
import { requireProfileComplete } from '../middleware/profileCompletion.middleware.js'
import { upload } from '../middleware/upload.middleware.js'
import { validateImageUpload } from '../middleware/imageUpload.middleware.js'
import { createEvent, listApprovedEvents, myEvents } from '../controllers/event.controller.js'

const router = Router()

router.use(requireAuth, requireProfileComplete)

router.get('/', listApprovedEvents)
router.get('/mine', myEvents)
router.post('/', upload.single('poster'), validateImageUpload, createEvent)

export default router
