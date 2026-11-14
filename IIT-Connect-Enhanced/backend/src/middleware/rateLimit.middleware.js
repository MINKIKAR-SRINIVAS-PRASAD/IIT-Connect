import rateLimit from 'express-rate-limit'
import { env } from '../config/env.js'

export const authRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  limit: env.RATE_LIMIT_MAX,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' }
})

// Broad API protection complements the stricter login/register limiter.
// Health checks are excluded so hosting-platform probes are not throttled.
export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skip: (req) => req.path.startsWith('/health'),
  message: { success: false, message: 'API request limit reached. Please try again later.' }
})
