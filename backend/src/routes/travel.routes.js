import { Router } from 'express'
import {
  requireAuth,
  requireCompletedProfile
} from '../middleware/auth.middleware.js'

import {
  createTravelPost,
  listApprovedTravel,
  listMyTravel
} from '../controllers/travel.controller.js'

const router = Router()

router.use(requireAuth, requireCompletedProfile)

router.get('/', listApprovedTravel)
router.get('/mine', listMyTravel)
router.post('/', createTravelPost)

export default router
