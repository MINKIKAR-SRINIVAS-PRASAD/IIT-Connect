import { deleteTravelSubmission } from '../controllers/travel.controller.js'
import { Router } from 'express'
import { requireAuth } from '../middleware/auth.middleware.js'
import { createTravelPost, listApprovedTravel, listMyTravel } from '../controllers/travel.controller.js'

const router = Router()

router.get('/', listApprovedTravel)
router.delete('/:id', requireAuth, deleteTravelSubmission)
router.get('/mine', requireAuth, listMyTravel)
router.post('/', requireAuth, createTravelPost)

export default router
