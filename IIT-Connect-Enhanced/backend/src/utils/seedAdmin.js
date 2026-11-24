import { env } from '../config/env.js'

export function getRoleForEmail(email) {
  const e = String(email || '').toLowerCase().trim()
  const configuredDefaultAdmin = String(env.DEFAULT_ADMIN_EMAIL || '').toLowerCase().trim()
  if (e && (e === configuredDefaultAdmin || (env.ADMIN_EMAILS || []).includes(e))) return 'admin'
  return 'student'
}
