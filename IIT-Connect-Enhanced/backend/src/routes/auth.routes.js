import { Router } from 'express'
import { body } from 'express-validator'
import { validate } from '../middleware/validate.middleware.js'
import { authRateLimiter } from '../middleware/rateLimit.middleware.js'
import { login, logout, me, refresh, forgotPassword, resetPassword, changePassword } from '../controllers/auth.controller.js'
import { sendRegistrationOtp, verifyRegistrationOtp } from '../controllers/emailVerification.controller.js'
import { requireAuth } from '../middleware/auth.middleware.js'

const router = Router()

router.post(
  '/send-otp',
  authRateLimiter,
  body('email').isEmail(),
  body('password').isString().isLength({ min: 8 }),
  validate,
  sendRegistrationOtp
)

router.post(
  '/verify-otp',
  authRateLimiter,
  body('email').isEmail(),
  body('otp').isString().matches(/^\d{6}$/),
  validate,
  verifyRegistrationOtp
)


// Backwards-compatible registration endpoints used by the currently deployed
// web/mobile clients. Keep the canonical /send-otp and /verify-otp routes too.
router.post(
  '/register/send-otp',
  authRateLimiter,
  body('email').isEmail(),
  body('password').isString().isLength({ min: 8 }),
  validate,
  sendRegistrationOtp
)

router.post(
  '/register/verify-otp',
  authRateLimiter,
  body('email').isEmail(),
  body('otp').isString().matches(/^\\d{6}$/),
  validate,
  verifyRegistrationOtp
)

router.post('/change-password', requireAuth, body('currentPassword').isString().notEmpty(), body('newPassword').isString().isLength({ min: 8 }), validate, changePassword)
router.post('/forgot-password', authRateLimiter, body('email').isEmail(), validate, forgotPassword)
router.post('/reset-password', authRateLimiter, body('email').isEmail(), body('otp').isString(), body('password').isString().isLength({ min: 8 }), validate, resetPassword)

// Login and all existing sessions remain unchanged.
router.post(
  '/login',
  authRateLimiter,
  body('email').isEmail(),
  body('password').isString().isLength({ min: 8 }),
  validate,
  login
)

router.post('/logout', logout)
router.post('/refresh', refresh)
router.get('/me', requireAuth, me)

export default router
