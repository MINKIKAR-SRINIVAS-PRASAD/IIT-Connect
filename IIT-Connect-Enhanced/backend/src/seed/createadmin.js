import bcrypt from "bcrypt"
import User from "../models/User.js"

export async function createDefaultAdmin(env) {
  const email = env.DEFAULT_ADMIN_EMAIL
  const password = env.DEFAULT_ADMIN_PASSWORD

  if (!email || !password) {
    console.log("⚠️ DEFAULT_ADMIN_EMAIL or DEFAULT_ADMIN_PASSWORD missing")
    return
  }

  let existing = await User.findOne({ email })
  if (!existing && env.ADMIN_EMAIL_MIGRATION_FROM && env.ADMIN_EMAIL_MIGRATION_FROM !== email) {
    existing = await User.findOne({ email: env.ADMIN_EMAIL_MIGRATION_FROM, role: 'admin' })
    if (existing) {
      const targetInUse = await User.findOne({ email })
      if (targetInUse) throw new Error('Cannot migrate admin email: target email already exists')
      existing.email = email
      existing.role = 'admin'
      await existing.save()
      console.log(`✅ Existing admin email migrated to: ${email}`)
      return
    }
  }
  if (existing) {
    console.log("✅ Default admin already exists")
    return
  }

  const passwordHash = await bcrypt.hash(password, 10)

  await User.create({
    email,
    passwordHash,
    role: "admin",
    isBanned: false,
    profile: {
      name: "Admin",
      iit: "IIT",
      branch: "Admin",
      batch: "0000",
      bio: "Default Admin Account",
      photoUrl: "",
      photoPublicId: ""
    }
  })

  console.log(`✅ Default admin created: ${email}`)
}

export async function createDemoAccounts(env) {
  const demos = [
    {
      email: env.DEMO_STUDENT_EMAIL,
      password: env.DEMO_STUDENT_PASSWORD,
      role: 'student',
      name: 'Demo Student'
    },
    {
      email: env.DEMO_FACULTY_EMAIL,
      password: env.DEMO_FACULTY_PASSWORD,
      role: 'faculty',
      name: 'Demo Faculty'
    }
  ]

  for (const demo of demos) {
    if (!demo.email || !demo.password) {
      console.log(`⚠️ Demo account skipped (${demo.role}): configure its email and password environment variables`)
      continue
    }
    let user = await User.findOne({ email: demo.email })
    if (!user) {
      user = await User.create({
        email: demo.email,
        passwordHash: await bcrypt.hash(demo.password, 12),
        role: demo.role,
        facultyVerified: demo.role === 'faculty',
        facultyRequestStatus: demo.role === 'faculty' ? 'approved' : null,
        profile: { name: demo.name, iit: 'Demo', branch: 'Demo', batch: '0000', bio: 'Demo account' },
        facultyProfile: demo.role === 'faculty' ? {
          name: demo.name, institute: 'Demo Institute', department: 'Demo', designation: 'Demo Faculty'
        } : undefined
      })
      console.log(`✅ Created ${demo.role} demo account: ${demo.email}`)
    } else {
      user.role = demo.role
      if (demo.role === 'faculty') {
        user.facultyVerified = true
        user.facultyRequestStatus = 'approved'
      }
      await user.save()
      console.log(`✅ Demo account exists: ${demo.email}`)
    }
  }
}
