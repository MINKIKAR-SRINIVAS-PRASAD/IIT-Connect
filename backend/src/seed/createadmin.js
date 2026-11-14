import bcrypt from "bcrypt"
import User from "../models/User.js"

export async function createDefaultAdmin(env) {
  const email = env.DEFAULT_ADMIN_EMAIL
  const password = env.DEFAULT_ADMIN_PASSWORD

  if (!email || !password) {
    console.log("⚠️ DEFAULT_ADMIN_EMAIL or DEFAULT_ADMIN_PASSWORD missing")
    return
  }

  const existing = await User.findOne({ email })
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
