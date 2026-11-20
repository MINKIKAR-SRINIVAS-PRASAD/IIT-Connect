import mongoose from 'mongoose'

const tripAccessRequestSchema = new mongoose.Schema({
  tripId: { type: mongoose.Schema.Types.ObjectId, ref: 'TravelPost', required: true, index: true },
  requesterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  requesterConsent: { type: Boolean, default: true },
  ownerConsent: { type: Boolean, default: false },
  status: { type: String, enum: ['Pending', 'Accepted', 'Declined', 'Cancelled'], default: 'Pending', index: true }
}, { timestamps: true })

tripAccessRequestSchema.index({ tripId: 1, requesterId: 1 }, { unique: true })

export default mongoose.model('TripAccessRequest', tripAccessRequestSchema)
