
import { Router } from 'express'
import {
  requireAuth,
  requireCompletedProfile
} from '../middleware/auth.middleware.js'

import {
  createPlacementPost,
  listApprovedPlacements,
  listMyPlacements
} from '../controllers/placement.controller.js'

const router = Router()

router.use(requireAuth, requireCompletedProfile)

router.get('/', listApprovedPlacements)
router.get('/mine', listMyPlacements)
router.post('/', createPlacementPost)

export default router
