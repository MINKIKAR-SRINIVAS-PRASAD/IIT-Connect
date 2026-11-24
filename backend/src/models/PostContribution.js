import mongoose from 'mongoose'

const postContributionSchema = new mongoose.Schema({
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  sourceModel: { type: String, required: true },
  sourceId: { type: mongoose.Schema.Types.ObjectId, required: true },
  points: { type: Number, default: 1, min: 1 },
  awardedAt: { type: Date, default: Date.now }
}, { timestamps: true })

// One approved post can award exactly one point, even if an admin toggles its status.
postContributionSchema.index({ sourceModel: 1, sourceId: 1 }, { unique: true })

export default mongoose.model('PostContribution', postContributionSchema)
