import { env } from '../config/env.js'

export function getRoleForEmail(email) {
  const e = (email || '').toLowerCase().trim()
  // The former student login must never retain admin privileges.
  if (e === '24me01058@iitbbs.ac.in') return 'student'
  if (env.ADMIN_EMAILS.includes(e) || e === env.DEFAULT_ADMIN_EMAIL) return 'admin'
  return 'student'
}
