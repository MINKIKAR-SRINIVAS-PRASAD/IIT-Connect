import mongoose from 'mongoose'

const likeSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    targetType: { type: String, enum: ['GalleryPost', 'PlacementPost', 'EventPost'], required: true, index: true },
    targetId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true }
  },
  { timestamps: true }
)

likeSchema.index({ userId: 1, targetType: 1, targetId: 1 }, { unique: true })

export default mongoose.model('Like', likeSchema)
