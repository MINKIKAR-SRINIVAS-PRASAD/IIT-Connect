import mongoose from 'mongoose'

const communityTripSchema = new mongoose.Schema({
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  destination: { type: String, required: true, trim: true, maxlength: 120 },
  location: { type: String, required: true, trim: true, maxlength: 120 },
  category: { type: String, enum: ['Trekking', 'Weekend Trips', 'Pilgrimage', 'Adventure', 'Sightseeing'], required: true },
  travelDate: { type: Date, required: true, index: true },
  budget: { type: Number, required: true, min: 1 },
  maxMembers: { type: Number, required: true, min: 2, max: 50 },
  currentMembers: { type: Number, default: 1, min: 1 },
  memberIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  description: { type: String, required: true, trim: true, maxlength: 1000 },
  status: { type: String, enum: ['Published', 'Cancelled'], default: 'Published', index: true }
}, { timestamps: true })

communityTripSchema.index({ status: 1, travelDate: 1, createdAt: -1 })
export default mongoose.model('CommunityTrip', communityTripSchema)
