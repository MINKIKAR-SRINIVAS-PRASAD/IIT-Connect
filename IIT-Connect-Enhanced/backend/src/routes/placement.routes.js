import { Router } from 'express'
import { requireAuth } from '../middleware/auth.middleware.js'
import { createPlacementPost, listApprovedPlacements, listMyPlacements, deletePlacement } from '../controllers/placement.controller.js'

const router = Router()

router.get('/', listApprovedPlacements)
router.get('/mine', requireAuth, listMyPlacements)
router.post('/', requireAuth, createPlacementPost)
router.delete('/:id',requireAuth,deletePlacement)

export default router
