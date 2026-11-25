import bcrypt from 'bcrypt'
import User from '../models/User.js'

// Demo accounts are never displayed in the client. Their credentials are held
// only in private backend environment variables and synced into these two
// explicitly configured identities.
export async function seedDemoAccounts(env) {
  const accounts = [
    {
      email: env.DEMO_STUDENT_EMAIL,
      password: env.DEMO_STUDENT_PASSWORD,
      role: 'student',
      facultyAccessStatus: 'not-applicable',
      profile: { name: 'Demo Student', iit: 'Demo Institute', branch: 'Demo' }
    },
    {
      email: env.DEMO_FACULTY_EMAIL,
      password: env.DEMO_FACULTY_PASSWORD,
      role: 'faculty',
      facultyAccessStatus: 'approved',
      profile: { name: 'Demo Faculty', institute: 'Demo Institute', department: 'Demo', designation: 'Faculty' }
    }
  ]

  for (const account of accounts) {
    const email = String(account.email || '').trim().toLowerCase()
    const password = String(account.password || '')
    if (!email || password.length < 8) continue
    const passwordHash = await bcrypt.hash(password, 12)
    await User.findOneAndUpdate(
      { email },
      { $set: {
        passwordHash,
        role: account.role,
        facultyAccessStatus: account.facultyAccessStatus,
        isBanned: false,
        profile: account.profile,
        refreshTokenHash: null
      } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )
  }
}
