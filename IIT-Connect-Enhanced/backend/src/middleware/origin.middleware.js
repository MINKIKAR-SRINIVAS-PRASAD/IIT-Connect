import { env } from '../config/env.js'

// SameSite=None cookies are needed when frontend and API are hosted on
// different sites. Validate browser Origin on unsafe methods to mitigate CSRF.
const UNSAFE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

export function requireTrustedOrigin(req, res, next) {
  if (!UNSAFE_METHODS.has(req.method)) return next()

  const origin = req.get('origin')
  if (!origin) {
    if (env.NODE_ENV === 'production') {
      return res.status(403).json({ success: false, message: 'Request origin required' })
    }
    return next()
  }

  try {
    const requestOrigin = new URL(origin).origin
    const allowedOrigin = new URL(env.CLIENT_ORIGIN).origin
    if (requestOrigin !== allowedOrigin) {
      return res.status(403).json({ success: false, message: 'Untrusted request origin' })
    }
  } catch {
    return res.status(403).json({ success: false, message: 'Invalid request origin' })
  }

  return next()
}
