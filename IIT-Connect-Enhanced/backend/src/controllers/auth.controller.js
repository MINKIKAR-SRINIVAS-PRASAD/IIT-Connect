import bcrypt from 'bcrypt'
import nodemailer from 'nodemailer'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/apiError.js'
import User from '../models/User.js'
import { cookieOptions } from '../utils/cookie.js'
import { isAllowedIitEmail, getIitNameFromEmail } from '../utils/allowedIitDomains.js'
import { getRoleForEmail } from '../utils/seedAdmin.js'

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase()
}

function signAccessToken(userId) {
  return jwt.sign({ sub: userId }, env.JWT_ACCESS_SECRET, { expiresIn: env.ACCESS_TOKEN_EXPIRES_IN })
}

function signRefreshToken(userId, sessionId) {
  return jwt.sign({ sub: userId, jti: sessionId }, env.JWT_REFRESH_SECRET, { expiresIn: env.REFRESH_TOKEN_EXPIRES_IN })
}

async function createRefreshSession(user) {
  const sessionId = crypto.randomUUID()
  const refreshToken = signRefreshToken(user._id.toString(), sessionId)
  const payload = jwt.decode(refreshToken)
  user.refreshSessions = (user.refreshSessions || []).filter((session) => session.expiresAt && session.expiresAt.getTime() > Date.now())
  user.refreshSessions.push({ sessionId, tokenHash: await bcrypt.hash(refreshToken, 12), expiresAt: new Date(payload.exp * 1000) })
  return refreshToken
}

async function setAuthCookies(res, { accessToken, refreshToken }) {
  const opts = cookieOptions()
  res.cookie('accessToken', accessToken, { ...opts, maxAge: 15 * 60 * 1000 })
  res.cookie('refreshToken', refreshToken, { ...opts, maxAge: 60 * 24 * 60 * 60 * 1000 })
}

export const register = asyncHandler(async (req, res) => {
  const email = normalizeEmail(req.body.email)
  const { password } = req.body

  if (!isAllowedIitEmail(email)) {
    throw new ApiError(400, 'Only IIT emails allowed')
  }

  // Administrator identities must be provisioned out-of-band, never self-registered.
  if (getRoleForEmail(email) === 'admin') {
    throw new ApiError(403, 'Administrator accounts are provisioned separately')
  }

  const existing = await User.findOne({ email })
  if (existing) throw new ApiError(409, 'Email already registered')

  const passwordHash = await bcrypt.hash(password, 12)
  const user = await User.create({
    email,
    passwordHash,
    role: 'student',
    profile: { iit: getIitNameFromEmail(email) }
  })

  const accessToken = signAccessToken(user._id.toString())
  const refreshToken = await createRefreshSession(user)
  await user.save()

  await setAuthCookies(res, { accessToken, refreshToken })

  res.status(201).json({
    success: true,
    user: {
      id: user._id,
      email: user.email,
      role: user.role,
      facultyVerified: user.facultyVerified,
      facultyProfile: user.facultyProfile,
      facultyRequestStatus: user.facultyRequestStatus,
      profile: user.profile
    }
  })
})

export const login = asyncHandler(async (req, res) => {
  const email = normalizeEmail(req.body.email)
  const { password } = req.body

  if (!isAllowedIitEmail(email) && !env.ADMIN_EMAILS.includes(email) && email !== env.DEFAULT_ADMIN_EMAIL && email !== env.DEMO_STUDENT_EMAIL && email !== env.DEMO_FACULTY_EMAIL) {
    throw new ApiError(400, 'Only approved IIT or administrator emails allowed')
  }

  const user = await User.findOne({ email })
  if (!user) throw new ApiError(401, 'Invalid credentials')
  if (user.isBanned) throw new ApiError(403, 'User is banned')

  const ok = await bcrypt.compare(password, user.passwordHash)
  if (!ok) throw new ApiError(401, 'Invalid credentials')

  const desiredRole = getRoleForEmail(user.email)
  // Repair legacy profile institute values from the verified institute email on sign-in.
  if (user.role === 'student') {
    const verifiedInstitute = getIitNameFromEmail(user.email)
    if (verifiedInstitute && user.profile.iit !== verifiedInstitute) user.profile.iit = verifiedInstitute
  }
  // Seeded admin identities retain their provisioned privilege; ordinary sign-ins
  // must never downgrade a faculty account to student.
  if (normalizeEmail(user.email) === '24me01058@iitbbs.ac.in') {
    user.role = 'student'
    user.facultyVerified = false
  } else if (desiredRole === 'admin' && user.role !== 'admin') user.role = 'admin'

  const accessToken = signAccessToken(user._id.toString())
  const refreshToken = await createRefreshSession(user)
  user.lastSeenAt = new Date()
  await user.save()

  await setAuthCookies(res, { accessToken, refreshToken })

  res.json({
    success: true,
    user: {
      id: user._id,
      email: user.email,
      role: user.role,
      facultyVerified: user.facultyVerified,
      facultyProfile: user.facultyProfile,
      facultyRequestStatus: user.facultyRequestStatus,
      profile: user.profile
    }
  })
})

export const logout = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken
  if (refreshToken) {
    try {
      const payload = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET)
      const user = await User.findById(payload.sub)
      if (user) {
        if (payload.jti) {
          user.refreshSessions = (user.refreshSessions || []).filter((session) => session.sessionId !== payload.jti)
        } else if (user.refreshTokenHash && await bcrypt.compare(refreshToken, user.refreshTokenHash)) {
          user.refreshTokenHash = null
        }
        await user.save()
      }
    } catch {
      // Clear cookies even if the refresh token is expired or malformed.
    }
  }
  const opts = cookieOptions()
  res.clearCookie('accessToken', opts)
  res.clearCookie('refreshToken', opts)
  res.json({ success: true })
})

const passwordResetMailer = env.SMTP_USER && env.SMTP_APP_PASSWORD
  ? nodemailer.createTransport({
      host: env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(env.SMTP_PORT || 465),
      secure: String(env.SMTP_SECURE ?? 'true') !== 'false',
      auth: { user: env.SMTP_USER, pass: String(env.SMTP_APP_PASSWORD).replace(/\\s/g, '') }
    })
  : null

export const forgotPassword = asyncHandler(async (req, res) => {
  const email = normalizeEmail(req.body.email)
  const user = await User.findOne({ email })
  const genericMessage = 'If that institute email has an account, a reset code will be sent.'
  if (!user || user.isBanned || !isAllowedIitEmail(email)) {
    return res.json({ success: true, message: genericMessage })
  }

  // Fail visibly instead of reporting success when the mail provider is not configured.
  if (!env.RESEND_API_KEY && (!passwordResetMailer || !(env.EMAIL_FROM || env.SMTP_FROM || env.SMTP_USER))) {
    throw new ApiError(503, 'Password reset email is not configured on the server. Please contact support.')
  }

  const now = Date.now()
  if (user.passwordResetSentAt && now - user.passwordResetSentAt.getTime() < 60_000) {
    throw new ApiError(429, 'Please wait 60 seconds before requesting another reset code.')
  }

  const otp = String(crypto.randomInt(0, 1_000_000)).padStart(6, '0')
  user.passwordResetOtpHash = crypto.createHmac('sha256', env.JWT_ACCESS_SECRET).update(`reset:${email}:${otp}`).digest('hex')
  user.passwordResetExpiresAt = new Date(now + 10 * 60_000)
  user.passwordResetAttempts = 0
  user.passwordResetSentAt = new Date(now)
  await user.save()

  try {
    if (env.RESEND_API_KEY) {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: env.EMAIL_FROM || env.SMTP_FROM,
          to: [email],
          subject: 'Reset your IIT Connect password',
          text: `Your IIT Connect password reset code is ${otp}. It expires in 10 minutes. If you did not request this, ignore this email.`
        })
      })
      if (!response.ok) {
        const providerMessage = await response.text().catch(() => '')
        console.error('Password reset email failed:', response.status, providerMessage.slice(0, 300))
        throw new Error('Resend rejected the email')
      }
    } else {
      await passwordResetMailer.sendMail({
        from: env.SMTP_FROM || env.EMAIL_FROM || env.SMTP_USER,
        to: email,
        subject: 'Reset your IIT Connect password',
        text: `Your IIT Connect password reset code is ${otp}. It expires in 10 minutes. If you did not request this, ignore this email.`,
        html: `<div style="font-family:Arial,sans-serif"><h2>IIT Connect</h2><p>Your password reset code:</p><strong style="font-size:28px;letter-spacing:6px">${otp}</strong><p>This code expires in 10 minutes.</p></div>`
      })
    }
  } catch (error) {
    user.passwordResetOtpHash = null
    user.passwordResetExpiresAt = null
    user.passwordResetSentAt = null
    await user.save()
    console.error('Password reset delivery failed:', error.message)
    throw new ApiError(502, 'Could not deliver the reset code. Check the email provider settings and try again.')
  }

  res.json({ success: true, message: genericMessage })
})

export const resetPassword = asyncHandler(async (req, res) => {
  const email = normalizeEmail(req.body.email)
  const otp = String(req.body.otp || '').trim()
  const password = String(req.body.password || '')
  const user = await User.findOne({ email })
  if (!user || !user.passwordResetOtpHash || !user.passwordResetExpiresAt || user.passwordResetExpiresAt.getTime() <= Date.now()) {
    throw new ApiError(400, 'Reset code is invalid or expired. Request a new one.')
  }
  if (user.passwordResetAttempts >= 5) {
    user.passwordResetOtpHash = null
    user.passwordResetExpiresAt = null
    await user.save()
    throw new ApiError(429, 'Too many incorrect attempts. Request a new reset code.')
  }
  const expected = Buffer.from(user.passwordResetOtpHash, 'hex')
  const received = Buffer.from(crypto.createHmac('sha256', env.JWT_ACCESS_SECRET).update(`reset:${email}:${otp}`).digest('hex'), 'hex')
  if (!/^\d{6}$/.test(otp) || expected.length !== received.length || !crypto.timingSafeEqual(expected, received)) {
    user.passwordResetAttempts += 1
    await user.save()
    throw new ApiError(400, 'Incorrect reset code')
  }
  user.passwordHash = await bcrypt.hash(password, 12)
  user.passwordResetOtpHash = null
  user.passwordResetExpiresAt = null
  user.passwordResetAttempts = 0
  user.passwordResetSentAt = null
  user.refreshSessions = []
  user.refreshTokenHash = null
  await user.save()
  res.json({ success: true, message: 'Password reset successfully. Please sign in again.' })
})

export const changePassword = asyncHandler(async (req, res) => {
  const currentPassword = String(req.body.currentPassword || '')
  const newPassword = String(req.body.newPassword || '')
  if (newPassword.length < 8) throw new ApiError(400, 'New password must be at least 8 characters')
  const user = await User.findById(req.user._id)
  if (!user || !await bcrypt.compare(currentPassword, user.passwordHash)) throw new ApiError(400, 'Current password is incorrect')
  user.passwordHash = await bcrypt.hash(newPassword, 12)
  user.refreshSessions = []
  user.refreshTokenHash = null
  await user.save()
  const refreshToken = await createRefreshSession(user)
  await user.save()
  const accessToken = signAccessToken(user._id.toString())
  await setAuthCookies(res, { accessToken, refreshToken })
  res.json({ success: true, message: 'Password changed successfully' })
})

export const me = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user })
})

export const refresh = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken
  if (!refreshToken) throw new ApiError(401, 'Unauthorized')

  let payload
  try { payload = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) }
  catch { throw new ApiError(401, 'Unauthorized') }

  const user = await User.findById(payload.sub)
  if (!user) throw new ApiError(401, 'Unauthorized')
  if (user.isBanned) throw new ApiError(403, 'User is banned')

  let session = payload.jti ? (user.refreshSessions || []).find((item) => item.sessionId === payload.jti) : null
  let refreshTokenToSet = refreshToken

  // Migrate a still-valid pre-multi-device token into its own session.
  if (!session && !payload.jti && user.refreshTokenHash && await bcrypt.compare(refreshToken, user.refreshTokenHash)) {
    const sessionId = crypto.randomUUID()
    const migratedToken = signRefreshToken(user._id.toString(), sessionId)
    refreshTokenToSet = migratedToken
    const migratedPayload = jwt.decode(migratedToken)
    user.refreshSessions = user.refreshSessions || []
    user.refreshSessions.push({
      sessionId,
      tokenHash: await bcrypt.hash(migratedToken, 12),
      expiresAt: new Date(migratedPayload.exp * 1000)
    })
    session = user.refreshSessions[user.refreshSessions.length - 1]
  }

  if (!session || !session.expiresAt || session.expiresAt.getTime() <= Date.now()) throw new ApiError(401, 'Unauthorized')
  if (!await bcrypt.compare(refreshToken, session.tokenHash)) throw new ApiError(401, 'Unauthorized')

  // Keep the refresh token stable until its JWT expiry. This avoids concurrent
  // tab/page refreshes invalidating one another while still revoking per-device on logout.
  const accessToken = signAccessToken(user._id.toString())
  // refreshTokenToSet may be replaced only when migrating a legacy session.
  user.refreshSessions = (user.refreshSessions || []).filter((item) => item.expiresAt && item.expiresAt.getTime() > Date.now())
  await user.save()
  await setAuthCookies(res, { accessToken, refreshToken: refreshTokenToSet })
  res.json({ success: true })
})
