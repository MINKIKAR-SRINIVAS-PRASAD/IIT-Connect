import mongoose from 'mongoose'

const travelPostSchema = new mongoose.Schema(
  {
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true },
    branch: { type: String, required: true },
    batch: { type: String, required: true },
    iit: { type: String, required: true, index: true },

    // Legacy Travel Community fields retained for the original trip-planning UI.
    destination: { type: String, required: true, maxlength: 120 },
    location: { type: String, required: true, maxlength: 120 },
    category: {
      type: String,
      enum: ['Trekking', 'Weekend Trips', 'Pilgrimage', 'Adventure', 'Sightseeing'],
      required: true
    },
    description: { type: String, required: true, maxlength: 1000 },
    budget: { type: String, default: '', maxlength: 40 },
    members: { type: Number, min: 1, max: 50, default: 1 },

    // Compatibility fields used by the travel moderation and older records.
    travelMode: { type: String, enum: ['Train', 'Flight', 'Bus', 'Trip'], default: 'Trip' },
    seatDetails: { type: String, default: '' },
    travelDate: { type: Date, default: null, index: true },
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
