import { env } from '../config/env.js'

export function getRoleForEmail(email) {
  const e = (email || '').toLowerCase().trim()
  if (env.ADMIN_EMAILS.includes(e)) return 'admin'
  return 'student'
}
