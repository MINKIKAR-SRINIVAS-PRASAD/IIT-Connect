import { Router } from 'express'
import { requireAuth } from '../middleware/auth.middleware.js'
import { countLikes, toggleLike } from '../controllers/like.controller.js'

const router = Router()

router.get('/', requireAuth, countLikes)
router.post('/toggle', requireAuth, toggleLike)

export default router
