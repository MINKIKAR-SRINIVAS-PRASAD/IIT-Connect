import mongoose from 'mongoose'

const eventPostSchema = new mongoose.Schema(
  {
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    iit: { type: String, required: true, index: true },
    title: { type: String, required: true },
    datetime: { type: Date, required: true, index: true },
    venue: { type: String, default: '' },
    posterUrl: { type: String, default: '' },
    posterPublicId: { type: String, default: '' },
    registrationLink: { type: String, default: '' },
    description: { type: String, default: '' },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending', index: true },
    rejectionReason: { type: String, default: '' }
  },
  { timestamps: true }
)

export default mongoose.model('EventPost', eventPostSchema)
