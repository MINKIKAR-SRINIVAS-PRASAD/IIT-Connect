import { ApiError } from '../utils/apiError.js'

export function requireFaculty(req, res, next) {
  if (req.user?.role !== 'faculty' || req.user?.facultyVerified !== true) {
    return next(new ApiError(403, 'Verified faculty workspace access required'))
  }
  next()
}
