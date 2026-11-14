import { Router } from 'express'
import { requireAuth } from '../middleware/auth.middleware.js'
import { requireProfileComplete } from '../middleware/profileCompletion.middleware.js'
import { createTravelPost, listApprovedTravel, listMyTravel } from '../controllers/travel.controller.js'

const router = Router()

router.use(requireAuth, requireProfileComplete)

router.get('/', listApprovedTravel)
router.get('/mine', listMyTravel)
router.post('/', createTravelPost)

export default router
