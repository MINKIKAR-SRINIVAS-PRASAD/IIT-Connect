import { Router } from 'express'
import { body } from 'express-validator'
import { validate } from '../middleware/validate.middleware.js'
import { authRateLimiter } from '../middleware/rateLimit.middleware.js'
import { login, logout, me, refresh, register, sendRegistrationOtp, verifyRegistrationOtp } from '../controllers/auth.controller.js'
import { requireAuth } from '../middleware/auth.middleware.js'

const router = Router()
router.post('/register/send-otp', authRateLimiter, body('email').isEmail(), body('password').isString().isLength({ min: 8 }), validate, sendRegistrationOtp)
router.post('/register/verify-otp', authRateLimiter, body('email').isEmail(), body('otp').isLength({ min: 6, max: 6 }).isNumeric(), validate, verifyRegistrationOtp)
router.post('/register', authRateLimiter, body('email').isEmail(), body('password').isString().isLength({ min: 8 }), validate, register)
router.post('/login', authRateLimiter, body('email').isEmail(), body('password').isString().isLength({ min: 8 }), validate, login)
router.post('/logout', logout)
router.post('/refresh', refresh)
router.get('/me', requireAuth, me)
export default router
