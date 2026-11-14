import mongoose from 'mongoose'

const placementPostSchema = new mongoose.Schema(
  {
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    companyName: { type: String, required: true, index: true },
    role: { type: String, required: true, index: true },
    ctc: { type: String, default: '' },
    interviewQuestions: [{ type: String }],
    rounds: [{ type: String }],
    tips: { type: String, default: '' },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending', index: true },
    rejectionReason: { type: String, default: '' }
  },
  { timestamps: true }
)

export default mongoose.model('PlacementPost', placementPostSchema)
