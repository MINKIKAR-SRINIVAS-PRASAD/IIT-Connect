import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['student', 'faculty', 'admin'], default: 'student' },
    isBanned: { type: Boolean, default: false },
    postStreakPoints: { type: Number, default: 0, min: 0 },
    achievementCertificateId: { type: String, default: '', unique: true, sparse: true },
    achievementCertificateIssuedAt: { type: Date, default: null },
    postStreakPoints: { type: Number, default: 0, min: 0 },

    profile: {
      name: { type: String, default: '' },
      iit: { type: String, default: '' },
      rollNumber: { type: String, default: '', index: true },
      branch: { type: String, default: '' },
      batch: { type: String, default: '' },
      bio: { type: String, default: '' },
      photoUrl: { type: String, default: '' },
      photoPublicId: { type: String, default: '' }
    },

    lastSeenAt: { type: Date, default: null },
    refreshTokenHash: { type: String, default: null }
  },
  { timestamps: true }
)

export default mongoose.model('User', userSchema)
