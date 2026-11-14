
import { Router } from 'express'
import {
  requireAuth,
  requireCompletedProfile
} from '../middleware/auth.middleware.js'

import {
  countLikes,
  toggleLike
} from '../controllers/like.controller.js'

const router = Router()

router.use(requireAuth, requireCompletedProfile)

router.get('/', countLikes)
router.post('/toggle', toggleLike)

export default router
