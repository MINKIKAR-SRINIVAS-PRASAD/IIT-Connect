import mongoose from 'mongoose'

const commentSchema = new mongoose.Schema(
  {
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    targetType: { type: String, enum: ['GalleryPost', 'PlacementPost', 'EventPost'], required: true, index: true },
    targetId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    text: { type: String, required: true }
  },
  { timestamps: true }
)

export default mongoose.model('Comment', commentSchema)
