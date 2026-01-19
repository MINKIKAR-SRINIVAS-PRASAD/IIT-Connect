import { env } from '../config/env.js'

export function cookieOptions() {
  const isProd = env.NODE_ENV === 'production'
  return {
    httpOnly: true,
    secure: isProd, // must be true in production (https)
    sameSite: isProd ? 'none' : 'lax',
    path: '/',
  }
}
