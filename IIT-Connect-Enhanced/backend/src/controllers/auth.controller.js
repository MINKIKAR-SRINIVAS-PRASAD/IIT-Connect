import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/apiError.js'
import User from '../models/User.js'
import { cookieOptions } from '../utils/cookie.js'
import { isAllowedIitEmail } from '../utils/allowedIitDomains.js'
import { getRoleForEmail } from '../utils/seedAdmin.js'

function signAccessToken(userId) {
  return jwt.sign({ sub: userId }, env.JWT_ACCESS_SECRET, { expiresIn: env.ACCESS_TOKEN_EXPIRES_IN })
}

function signRefreshToken(userId) {
  return jwt.sign({ sub: userId }, env.JWT_REFRESH_SECRET, { expiresIn: env.REFRESH_TOKEN_EXPIRES_IN })
}

async function setAuthCookies(res, { accessToken, refreshToken }) {
  const opts = cookieOptions()
  res.cookie('accessToken', accessToken, { ...opts, maxAge: 15 * 60 * 1000 })
  res.cookie('refreshToken', refreshToken, { ...opts, maxAge: 7 * 24 * 60 * 60 * 1000 })
}

export const register = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  if (!isAllowedIitEmail(email)) {
    throw new ApiError(400, 'Only IIT emails allowed')
  }

  const existing = await User.findOne({ email: email.toLowerCase() })
  if (existing) throw new ApiError(409, 'Email already registered')

  const passwordHash = await bcrypt.hash(password, 10)
  const role = getRoleForEmail(email)

  const user = await User.create({
    email: email.toLowerCase(),
    passwordHash,
    role
  })

  const accessToken = signAccessToken(user._id.toString())
  const refreshToken = signRefreshToken(user._id.toString())
  user.refreshTokenHash = await bcrypt.hash(refreshToken, 10)
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

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  if (!isAllowedIitEmail(email)) {
    throw new ApiError(400, 'Only IIT emails allowed')
  }

  const user = await User.findOne({ email: email.toLowerCase() })
  if (!user) throw new ApiError(401, 'Invalid credentials')
  if (user.isBanned) throw new ApiError(403, 'User is banned')

  const ok = await bcrypt.compare(password, user.passwordHash)
  if (!ok) throw new ApiError(401, 'Invalid credentials')

  // promote to admin only if in ADMIN_EMAILS
  const desiredRole = getRoleForEmail(user.email)
  if (user.role !== desiredRole) {
    user.role = desiredRole
  }

  const accessToken = signAccessToken(user._id.toString())
  const refreshToken = signRefreshToken(user._id.toString())
  user.refreshTokenHash = await bcrypt.hash(refreshToken, 10)
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
  try {
    payload = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET)
  } catch {
    throw new ApiError(401, 'Unauthorized')
  }

  const user = await User.findById(payload.sub)
  if (!user) throw new ApiError(401, 'Unauthorized')
  if (user.isBanned) throw new ApiError(403, 'User is banned')

  const matches = await bcrypt.compare(refreshToken, user.refreshTokenHash || '')
  if (!matches) throw new ApiError(401, 'Unauthorized')

  const newAccess = signAccessToken(user._id.toString())
  const newRefresh = signRefreshToken(user._id.toString())
  user.refreshTokenHash = await bcrypt.hash(newRefresh, 10)
  await user.save()

  await setAuthCookies(res, { accessToken: newAccess, refreshToken: newRefresh })

  res.json({ success: true })
})
