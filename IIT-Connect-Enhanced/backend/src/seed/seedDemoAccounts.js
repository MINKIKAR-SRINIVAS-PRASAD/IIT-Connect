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
      facultyAccessStatus: 'pending', // Demo faculty is a reviewable test account.
      profile: { name: 'Demo Faculty', institute: 'Demo Institute', department: 'Demo', designation: 'Faculty' }
    }
  ]

  for (const account of accounts) {
    const email = String(account.email || '').trim().toLowerCase()
    const password = String(account.password || '')
    if (!email || password.length < 8) continue
    const passwordHash = await bcrypt.hash(password, 12)
    // Refresh demo credentials safely without resetting a faculty approval
    // decision on every server restart/deploy. Status/profile are initialized
    // only for a newly created demo identity.
    await User.findOneAndUpdate(
      { email },
      {
        $set: { passwordHash, isBanned: false, refreshTokenHash: null },
        $setOnInsert: {
          role: account.role,
          facultyAccessStatus: account.facultyAccessStatus,
          demoFacultyReviewInitialized: account.role === 'faculty',
          profile: account.profile
        }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )
  }
}
