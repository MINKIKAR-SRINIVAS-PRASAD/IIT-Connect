import { Router } from 'express'
import { requireAuth } from '../middleware/auth.middleware.js'
import { requireStudentCommunity } from '../middleware/studentCommunity.middleware.js'
import { requireProfileComplete } from '../middleware/profileCompletion.middleware.js'
import { createPlacementPost, listApprovedPlacements, listMyPlacements } from '../controllers/placement.controller.js'

const router = Router()

router.use(requireAuth, requireStudentCommunity, requireProfileComplete)

router.get('/', listApprovedPlacements)
router.get('/mine', listMyPlacements)
router.post('/', createPlacementPost)

export default router
