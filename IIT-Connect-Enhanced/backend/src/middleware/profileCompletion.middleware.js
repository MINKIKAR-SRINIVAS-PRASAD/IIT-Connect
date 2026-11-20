import { ApiError } from '../utils/apiError.js'
import { isProfileComplete } from '../utils/profileCompletion.js'

export function requireProfileComplete(req, res, next) {
  if (!req.user) return next(new ApiError(401, 'Unauthorized'))

  // Admin accounts are provisioned separately and are not subject to student onboarding.
  if (req.user.role === 'admin' || isProfileComplete(req.user)) return next()

  return next(new ApiError(403, 'Complete your profile, including a profile photo, to access this feature', {
    code: 'PROFILE_INCOMPLETE',
    redirectTo: '/app/profile'
  }))
}
