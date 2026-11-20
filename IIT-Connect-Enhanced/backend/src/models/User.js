import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['student', 'admin'], default: 'student' },
    isBanned: { type: Boolean, default: false },

    profile: {
      name: { type: String, default: '' },
      rollNumber: { type: String, default: '', trim: true, uppercase: true, index: true },
      iit: { type: String, default: '' },
      branch: { type: String, default: '' },
      batch: { type: String, default: '' },
      bio: { type: String, default: '' },
      photoUrl: { type: String, default: '' },
      photoPublicId: { type: String, default: '' }
    },

    lastSeenAt: { type: Date, default: null },
    // Legacy single-token field retained temporarily for existing sessions.
    refreshTokenHash: { type: String, default: null },
    // Independent hashed refresh-token sessions allow safe multi-device logins.
    refreshSessions: [{
      sessionId: { type: String, required: true },
      tokenHash: { type: String, required: true },
      expiresAt: { type: Date, required: true }
    }]
  },
  { timestamps: true }
)

export default mongoose.model('User', userSchema)
