import mongoose from 'mongoose'

const registrationOtpSchema = new mongoose.Schema({
  email: { type: String, required: true, lowercase: true, unique: true, index: true },
  passwordHash: { type: String, required: true },
  accountType: { type: String, enum: ['student', 'faculty'], default: 'student' },
  facultyProfile: {
    name: String, institute: String, department: String, designation: String, researchInterests: String
  },
  otpHash: { type: String, required: true },
  expiresAt: { type: Date, required: true, index: { expires: 0 } },
  lastSentAt: { type: Date, required: true },
  attempts: { type: Number, default: 0 }
}, { timestamps: true })

export default mongoose.model('RegistrationOtp', registrationOtpSchema)
