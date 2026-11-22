
import jwt from 'jsonwebtoken'

import { env } from '../config/env.js'
import { ApiError } from '../utils/apiError.js'
import User from '../models/User.js'

// AUTHENTICATION
export async function requireAuth(req, res, next) {
  try {
    const token = req.cookies?.accessToken

    if (!token) {
      return next(new ApiError(401, 'Unauthorized'))
    }

    const payload = jwt.verify(
      token,
      env.JWT_ACCESS_SECRET
    )

    const user = await User.findById(payload.sub)
      .select('-passwordHash -refreshTokenHash')

    if (!user) {
      return next(new ApiError(401, 'Unauthorized'))
    }

    if (user.isBanned) {
      return next(new ApiError(403, 'User is banned'))
    }

    req.user = user

    return next()
  } catch (error) {
    return next(new ApiError(401, 'Unauthorized'))
  }
}

// MANDATORY PROFILE COMPLETION
export function requireCompletedProfile(req, res, next) {
  // Admins do not need student profile completion
  if (req.user?.role === 'admin' || req.user?.role === 'faculty') {
    return next()
  }

  const profile = req.user?.profile

  const complete = Boolean(
    profile?.name?.trim() &&
    profile?.iit?.trim() &&
    profile?.branch?.trim() &&
    profile?.batch?.trim()
  )

  if (!complete) {
    return next(
      new ApiError(
        403,
        'Please complete your profile before accessing this feature'
      )
    )
  }

  return next()
}

// ADMIN AUTHORIZATION
export function requireAdmin(req, res, next) {
  if (!req.user) {
    return next(new ApiError(401, 'Unauthorized'))
  }

  if (req.user.role !== 'admin') {
    return next(new ApiError(403, 'Admin access required'))
  }

  return next()
}


// Only explicitly configured faculty accounts may access faculty-only endpoints.
export function requireFaculty(req, res, next) {
  if (!req.user) return next(new ApiError(401, 'Unauthorized'))
  if (req.user.role !== 'faculty') return next(new ApiError(403, 'Faculty access required'))
  if (!req.user.facultyVerified) return next(new ApiError(403, 'Faculty verification is pending'))
  return next()
}
