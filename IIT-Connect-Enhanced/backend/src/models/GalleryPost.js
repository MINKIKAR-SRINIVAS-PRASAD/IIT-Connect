import mongoose from 'mongoose'

const galleryPostSchema = new mongoose.Schema(
  {
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    iit: { type: String, required: true },
    caption: { type: String, default: '' },
    imageUrl: { type: String, required: true },
    imagePublicId: { type: String, required: true },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected', 'Deleted'], default: 'Pending', index: true },
    rejectionReason: { type: String, default: '' },
    deletedAt: { type: Date, default: null },
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
  },
  { timestamps: true }
)

export default mongoose.model('GalleryPost', galleryPostSchema)
