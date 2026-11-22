
import express from 'express'

import {
  login,
  logout,
  me,
  refresh,
  register,
  sendRegistrationOtp,
  verifyRegistrationOtp
} from '../controllers/auth.controller.js'

import {
  requireAuth
} from '../middleware/auth.middleware.js'

const router = express.Router()

// Email OTP registration
router.post('/register/send-otp', sendRegistrationOtp)
router.post('/register/verify-otp', verifyRegistrationOtp)

// Legacy registration endpoint
router.post('/register', register)

// Login for students and configured admins
router.post('/login', login)

// Logout
router.post('/logout', logout)

// Get currently authenticated user
router.get('/me', requireAuth, me)

// Refresh authentication tokens
router.post('/refresh', refresh)

export default router
