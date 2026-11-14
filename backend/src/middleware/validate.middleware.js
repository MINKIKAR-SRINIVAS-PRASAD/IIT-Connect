import { validationResult } from 'express-validator'
import { ApiError } from '../utils/apiError.js'

export function validate(req, res, next) {
  const result = validationResult(req)
  if (!result.isEmpty()) {
    return next(new ApiError(400, 'Validation error', result.array()))
  }
  next()
}
