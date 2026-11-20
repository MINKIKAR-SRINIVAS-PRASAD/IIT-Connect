import bcrypt from 'bcrypt'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/apiError.js'
import User from '../models/User.js'
import { cookieOptions } from '../utils/cookie.js'
import { isAllowedIitEmail } from '../utils/allowedIitDomains.js'
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
  res.cookie('refreshToken', refreshToken, { ...opts, maxAge: 7 * 24 * 60 * 60 * 1000 })
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
    role: 'student'
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
      profile: user.profile
    }
  })
})

export const login = asyncHandler(async (req, res) => {
  const email = normalizeEmail(req.body.email)
  const { password } = req.body

  if (!isAllowedIitEmail(email)) {
    throw new ApiError(400, 'Only IIT emails allowed')
  }

  const user = await User.findOne({ email })
  if (!user) throw new ApiError(401, 'Invalid credentials')
  if (user.isBanned) throw new ApiError(403, 'User is banned')

  const ok = await bcrypt.compare(password, user.passwordHash)
  if (!ok) throw new ApiError(401, 'Invalid credentials')

  const desiredRole = getRoleForEmail(user.email)
  if (user.role !== desiredRole) user.role = desiredRole

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
