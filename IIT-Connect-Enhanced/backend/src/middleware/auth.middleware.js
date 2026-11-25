import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import { ApiError } from '../utils/apiError.js'
import User from '../models/User.js'

export async function requireAuth(req, res, next) {
  try {
    const token = req.cookies?.accessToken
    if (!token) return next(new ApiError(401, 'Unauthorized'))

    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET)
    const user = await User.findById(payload.sub).select('-passwordHash -refreshTokenHash')
    if (!user) return next(new ApiError(401, 'Unauthorized'))
    if (user.isBanned) return next(new ApiError(403, 'User is banned'))

    req.user = user
    next()
  } catch (e) {
    return next(new ApiError(401, 'Unauthorized'))
  }
}


// Allows public endpoints to return public content while tailoring private content
// to a signed-in viewer. Invalid/expired cookies are treated as anonymous.
export async function optionalAuth(req, _res, next) {
  try {
    const token = req.cookies?.accessToken
    if (!token) return next()
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET)
    const user = await User.findById(payload.sub).select('-passwordHash -refreshTokenHash')
    if (user && !user.isBanned) req.user = user
  } catch {
    req.user = undefined
  }
  return next()
}
