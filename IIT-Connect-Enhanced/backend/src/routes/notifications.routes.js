import { Router } from 'express'
import { requireAuth } from '../middleware/auth.middleware.js'
import { publicKey, saveSubscription, removeSubscription, subscriptionStatus } from '../controllers/notifications.controller.js'

const router = Router()
router.get('/public-key', publicKey)
router.use(requireAuth)
router.get('/status', subscriptionStatus)
router.post('/subscribe', saveSubscription)
router.delete('/subscribe', removeSubscription)

export default router
