import { ApiError } from '../utils/apiError.js'

export function notFound(req, res, next) {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`))
}

export function errorHandler(err, req, res, next) {
  const status = err.statusCode || 500
  const message = err.message || 'Server Error'

  if (status >= 500) {
    console.error('🔥 Error:', err)
  }

  res.status(status).json({
    success: false,
    message,
    details: err.details || null
  })
}
