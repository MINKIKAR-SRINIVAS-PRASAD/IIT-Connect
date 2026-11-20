import mongoose from 'mongoose'

const pendingEmailVerificationSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, index: true },
  passwordHash: { type: String, required: true },
  otpHash: { type: String, required: true },
  expiresAt: { type: Date, required: true, index: { expires: 0 } },
  lastSentAt: { type: Date, required: true },
  attempts: { type: Number, default: 0 },
  resendCount: { type: Number, default: 0 }
}, { timestamps: true })

export default mongoose.model('PendingEmailVerification', pendingEmailVerificationSchema)
