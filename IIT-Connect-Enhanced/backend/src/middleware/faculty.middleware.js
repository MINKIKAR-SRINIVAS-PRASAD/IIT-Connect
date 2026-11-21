import { ApiError } from '../utils/apiError.js'

export function requireFaculty(req, res, next) {
  // Admins may inspect the faculty workspace for moderation and QA.
  if (req.user?.role === 'admin') return next()
  if (req.user?.role !== 'faculty' || req.user?.facultyVerified !== true) {
    return next(new ApiError(403, 'Verified faculty workspace access required'))
  }
  next()
}
