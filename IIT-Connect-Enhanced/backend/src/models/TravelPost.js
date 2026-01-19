import mongoose from 'mongoose'

const travelPostSchema = new mongoose.Schema(
  {
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true },
    branch: { type: String, required: true },
    batch: { type: String, required: true },
    iit: { type: String, required: true, index: true },
    travelMode: { type: String, enum: ['Train', 'Flight', 'Bus'], required: true },
    seatDetails: { type: String, default: '' }, // coach/seat number
    travelDate: { type: Date, required: true, index: true },
    from: { type: String, required: true },
    to: { type: String, required: true },
    notes: { type: String, default: '' },
    contactPreference: { type: String, enum: ['Email', 'Phone', 'WhatsApp'], default: 'Email' },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending', index: true },
    rejectionReason: { type: String, default: '' }
  },
  { timestamps: true }
)

export default mongoose.model('TravelPost', travelPostSchema)
