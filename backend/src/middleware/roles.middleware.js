import { ApiError } from '../utils/apiError.js'

export function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) return next(new ApiError(401, 'Unauthorized'))
    if (req.user.role !== role) return next(new ApiError(403, 'Forbidden'))
    next()
  }
}
