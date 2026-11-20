import { Router } from 'express'
import { requireAuth } from '../middleware/auth.middleware.js'
import { requireProfileComplete } from '../middleware/profileCompletion.middleware.js'
import { countLikes, toggleLike } from '../controllers/like.controller.js'

const router = Router()

router.use(requireAuth, requireProfileComplete)

router.get('/', countLikes)
router.post('/toggle', toggleLike)

export default router
