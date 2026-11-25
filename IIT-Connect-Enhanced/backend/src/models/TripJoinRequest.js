import mongoose from 'mongoose'

const tripJoinRequestSchema = new mongoose.Schema({
  tripId: { type: mongoose.Schema.Types.ObjectId, ref: 'CommunityTrip', required: true, index: true },
  requesterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  status: { type: String, enum: ['Pending', 'Accepted', 'Declined'], default: 'Pending', index: true }
}, { timestamps: true })

tripJoinRequestSchema.index({ tripId: 1, requesterId: 1 }, { unique: true })
export default mongoose.model('TripJoinRequest', tripJoinRequestSchema)
