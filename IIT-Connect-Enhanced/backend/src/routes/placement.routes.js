import { Router } from 'express'
import { requireAuth } from '../middleware/auth.middleware.js'
import { createPlacementPost, listApprovedPlacements, listMyPlacements } from '../controllers/placement.controller.js'

const router = Router()

router.get('/', listApprovedPlacements)
router.get('/mine', requireAuth, listMyPlacements)
router.post('/', requireAuth, createPlacementPost)

export default router
