
import bcrypt from 'bcrypt'
import crypto from 'crypto'
import nodemailer from 'nodemailer'
import RegistrationOtp from '../models/RegistrationOtp.js'
import jwt from 'jsonwebtoken'

import { env } from '../config/env.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/apiError.js'
import User from '../models/User.js'
import { cookieOptions } from '../utils/cookie.js'
import { isAllowedIitEmail, getIitForEmail } from '../utils/allowedIitDomains.js'
import { getRoleForEmail } from '../utils/seedAdmin.js'

// Normalize email addresses
function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase()
}

// Admin email configuration
function isConfiguredAdmin(email) {
  const adminEmails = [
    ...(env.ADMIN_EMAILS || []),
    env.DEFAULT_ADMIN_EMAIL
  ]
    .filter(Boolean)
    .map((value) => value.trim().toLowerCase())

  return adminEmails.includes(email)
}

// Generate access token
function signAccessToken(userId) {
  return jwt.sign(
    { sub: userId },
    env.JWT_ACCESS_SECRET,
    { expiresIn: env.ACCESS_TOKEN_EXPIRES_IN }
  )
}

// Generate refresh token
function signRefreshToken(userId) {
  return jwt.sign(
    { sub: userId },
    env.JWT_REFRESH_SECRET,
    { expiresIn: env.REFRESH_TOKEN_EXPIRES_IN }
  )
}

// Set authentication cookies
function setAuthCookies(res, accessToken, refreshToken) {
  const opts = cookieOptions()

  res.cookie('accessToken', accessToken, {
    ...opts,
    maxAge: 15 * 60 * 1000
  })

  res.cookie('refreshToken', refreshToken, {
    ...opts,
    maxAge: 7 * 24 * 60 * 60 * 1000
  })
}

// Remove sensitive fields from API response
function publicUser(user) {
  return {
    id: user._id,
    email: user.email,
    role: user.role,
    profile: user.profile
  }
}

// REGISTER
export const register = asyncHandler(async (req, res) => {
  const email = normalizeEmail(req.body.email)
  const { password } = req.body

  if (!email || !password) {
    throw new ApiError(400, 'Email and password are required')
  }

  if (password.length < 8) {
    throw new ApiError(400, 'Password must contain at least 8 characters')
  }

  // Admin accounts must be created through the backend seed process
  if (isConfiguredAdmin(email)) {
    throw new ApiError(403, 'Admin accounts are provisioned separately')
  }

  // Only approved institute emails can register
  if (!isAllowedIitEmail(email)) {
    throw new ApiError(400, 'Only IIT emails allowed')
  }

  const existingUser = await User.findOne({ email })

  if (existingUser) {
    throw new ApiError(409, 'Email already registered')
  }

  const passwordHash = await bcrypt.hash(password, 12)

  const role = getRoleForEmail(email)

  const user = await User.create({
    email,
    passwordHash,
    role,
    profile: { iit: getIitForEmail(email) }
  })

  const accessToken = signAccessToken(user._id.toString())
  const refreshToken = signRefreshToken(user._id.toString())

  user.refreshTokenHash = await bcrypt.hash(refreshToken, 12)

  await user.save()

  setAuthCookies(res, accessToken, refreshToken)

  res.status(201).json({
    success: true,
    message: 'Registration successful',
    user: publicUser(user)
  })
})

// LOGIN
export const login = asyncHandler(async (req, res) => {
  const email = normalizeEmail(req.body.email)
  const { password } = req.body

  if (!email || !password) {
    throw new ApiError(400, 'Email and password are required')
  }

  // Configured admins can use non-institute email addresses
  const isAdminEmail = isConfiguredAdmin(email)

  // Students must use approved institute email addresses
  if (!isAdminEmail && !isAllowedIitEmail(email)) {
    throw new ApiError(400, 'Only IIT emails allowed')
  }

  const user = await User.findOne({ email }).select('+passwordHash')

  if (!user) {
    throw new ApiError(401, 'Invalid credentials')
  }

  if (user.isBanned) {
    throw new ApiError(403, 'User is banned')
  }

  // Verify password
  const passwordValid = await bcrypt.compare(
    password,
    user.passwordHash || ''
  )

  if (!passwordValid) {
    throw new ApiError(401, 'Invalid credentials')
  }

  // Resolve privileged roles only from server-side allowlists.
  // This also updates existing accounts when faculty access is granted or revoked.
  if (isAdminEmail) {
    user.role = 'admin'
  } else {
    user.role = getRoleForEmail(email)
  }

  user.lastSeenAt = new Date()

  // Generate tokens
  const accessToken = signAccessToken(user._id.toString())
  const refreshToken = signRefreshToken(user._id.toString())

  user.refreshTokenHash = await bcrypt.hash(refreshToken, 12)

  await user.save()

  setAuthCookies(res, accessToken, refreshToken)

  res.json({
    success: true,
    message: 'Login successful',
    user: publicUser(user)
  })
})

// LOGOUT
export const logout = asyncHandler(async (req, res) => {
  const opts = cookieOptions()

  res.clearCookie('accessToken', opts)
  res.clearCookie('refreshToken', opts)

  res.json({
    success: true,
    message: 'Logged out successfully'
  })
})

// CURRENT USER
export const me = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    user: publicUser(req.user)
  })
})

// REFRESH TOKEN
export const refresh = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken

  if (!refreshToken) {
    throw new ApiError(401, 'Refresh token missing')
  }

  let payload

  try {
    payload = jwt.verify(
      refreshToken,
      env.JWT_REFRESH_SECRET
    )
  } catch {
    throw new ApiError(401, 'Invalid refresh token')
  }

  const user = await User.findById(payload.sub)

  if (!user) {
    throw new ApiError(401, 'User not found')
  }

  if (user.isBanned) {
    throw new ApiError(403, 'User is banned')
  }

  const tokenMatches = await bcrypt.compare(
    refreshToken,
    user.refreshTokenHash || ''
  )

  if (!tokenMatches) {
    throw new ApiError(401, 'Refresh token does not match')
  }

  const newAccessToken = signAccessToken(user._id.toString())
  const newRefreshToken = signRefreshToken(user._id.toString())

  user.refreshTokenHash = await bcrypt.hash(
    newRefreshToken,
    12
  )

  await user.save()

  setAuthCookies(res, newAccessToken, newRefreshToken)

  res.json({
    success: true,
    message: 'Token refreshed successfully'
  })
})

// Email verification for registration
const registrationMailer = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: Number(env.SMTP_PORT || 587),
  secure: String(env.SMTP_SECURE || 'false') === 'true',
  auth: { user: env.SMTP_USER, pass: env.SMTP_APP_PASSWORD }
})

export const sendRegistrationOtp = asyncHandler(async (req, res) => {
  const email = normalizeEmail(req.body.email)
  const password = String(req.body.password || '')
  const accountType = req.body.accountType === 'faculty' ? 'faculty' : 'student'
  const facultyProfile = req.body.facultyProfile || {}
  if (!email || password.length < 8) throw new ApiError(400, 'Valid institute email and password (8+ characters) are required')
  if (!isAllowedIitEmail(email)) throw new ApiError(400, 'Only approved IIT emails are allowed')
  if (isConfiguredAdmin(email)) throw new ApiError(403, 'Admin accounts are provisioned separately')
  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_APP_PASSWORD) throw new ApiError(503, 'Email verification is not configured. Please contact support.')
  if (accountType === 'faculty' && ['name','institute','department','designation'].some(k => !String(facultyProfile[k] || '').trim())) {
    throw new ApiError(400, 'Please complete all required faculty details')
  }
  if (await User.findOne({ email })) throw new ApiError(409, 'Email already registered')
  const prior = await RegistrationOtp.findOne({ email })
  if (prior && Date.now() - prior.lastSentAt.getTime() < 60000) throw new ApiError(429, 'Please wait 60 seconds before requesting another code')
  const otp = String(crypto.randomInt(0, 1000000)).padStart(6, '0')
  const passwordHash = await bcrypt.hash(password, 12)
  const otpHash = crypto.createHash('sha256').update(otp + email).digest('hex')
  await RegistrationOtp.findOneAndUpdate({ email }, {
    email, passwordHash, accountType, facultyProfile, otpHash,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000), lastSentAt: new Date(), attempts: 0
  }, { upsert: true, new: true, setDefaultsOnInsert: true })
  try {
    await registrationMailer.sendMail({
      from: env.SMTP_FROM || env.SMTP_USER, to: email,
      subject: 'Your IIT Connect verification code',
      text: `Your IIT Connect registration code is ${otp}. It expires in 5 minutes.`,
      html: `<div style="font-family:Arial,sans-serif"><h2>IIT Connect</h2><p>Your verification code:</p><strong style="font-size:30px;letter-spacing:8px">${otp}</strong><p>Expires in 5 minutes.</p></div>`
    })
  } catch (err) {
    await RegistrationOtp.deleteOne({ email })
    console.error('Registration OTP email failed:', err.message)
    throw new ApiError(502, 'Could not send email. Check SMTP settings and try again.')
  }
  res.json({ success: true, message: 'Verification code sent' })
})

export const verifyRegistrationOtp = asyncHandler(async (req, res) => {
  const email = normalizeEmail(req.body.email)
  const otp = String(req.body.otp || '').trim()
  const record = await RegistrationOtp.findOne({ email })
  if (!record) throw new ApiError(400, 'No active code. Please request a new one.')
  if (record.expiresAt.getTime() < Date.now()) {
    await RegistrationOtp.deleteOne({ email })
    throw new ApiError(400, 'Code expired. Please request a new one.')
  }
  if (record.attempts >= 5) {
    await RegistrationOtp.deleteOne({ email })
    throw new ApiError(429, 'Too many incorrect attempts. Request a new code.')
  }
  const hash = crypto.createHash('sha256').update(otp + email).digest('hex')
  if (hash !== record.otpHash) {
    record.attempts += 1
    await record.save()
    throw new ApiError(400, 'Incorrect verification code')
  }
  if (await User.findOne({ email })) {
    await RegistrationOtp.deleteOne({ email })
    throw new ApiError(409, 'Email already registered')
  }
  const isFaculty = record.accountType === 'faculty'
  const fp = record.facultyProfile || {}
  const user = await User.create({
    email, passwordHash: record.passwordHash,
    role: isFaculty ? 'faculty' : getRoleForEmail(email),
    profile: isFaculty ? { name: fp.name || '', iit: fp.institute || getIitForEmail(email), branch: fp.department || '' } : { iit: getIitForEmail(email) }
  })
  await RegistrationOtp.deleteOne({ email })
  const accessToken = signAccessToken(user._id.toString())
  const refreshToken = signRefreshToken(user._id.toString())
  user.refreshTokenHash = await bcrypt.hash(refreshToken, 12)
  await user.save()
  setAuthCookies(res, accessToken, refreshToken)
  res.status(201).json({ success: true, message: 'Email verified; account created', user: publicUser(user) })
})
