import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, index: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['student', 'faculty', 'admin'], default: 'student' },
  facultyAccessStatus: { type: String, enum: ['not-applicable', 'pending', 'approved', 'rejected'], default: 'not-applicable' },
  demoFacultyReviewInitialized: { type: Boolean, default: false },
  isBanned: { type: Boolean, default: false },
  postStreakPoints: { type: Number, default: 0, min: 0 },
  achievementCertificateId: { type: String, default: undefined, unique: true, sparse: true },
  achievementCertificateIssuedAt: { type: Date, default: null },
  profile: {
    name: { type: String, default: '' }, rollNumber: { type: String, default: '', uppercase: true, trim: true }, iit: { type: String, default: '' },
    branch: { type: String, default: '' }, batch: { type: String, default: '' },
    bio: { type: String, default: '' }, photoUrl: { type: String, default: '' },
    photoPublicId: { type: String, default: '' },
    institute: { type: String, default: '' }, department: { type: String, default: '' },
    designation: { type: String, default: '' }, researchInterests: { type: String, default: '' }
  },
  lastSeenAt: { type: Date, default: null },
  refreshTokenHash: { type: String, default: null }
}, { timestamps: true })

export default mongoose.model('User', userSchema)
