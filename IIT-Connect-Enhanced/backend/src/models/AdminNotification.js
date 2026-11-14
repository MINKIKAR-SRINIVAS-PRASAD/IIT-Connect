import mongoose from 'mongoose'

const adminNotificationSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['CONTENT_DELETED'], required: true, index: true },
    contentType: { type: String, enum: ['Gallery', 'Travel'], required: true },
    contentId: { type: mongoose.Schema.Types.ObjectId, required: true },
    contentTitle: { type: String, required: true, maxlength: 200 },
    actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    actorEmail: { type: String, required: true },
    actorName: { type: String, default: '' },
    institute: { type: String, default: '' },
    contentSnapshot: { type: mongoose.Schema.Types.Mixed, required: true },
    mediaCleanupPending: { type: Boolean, default: false },
    readAt: { type: Date, default: null, index: true }
  },
  { timestamps: true }
)

adminNotificationSchema.index({ createdAt: -1 })

export default mongoose.model('AdminNotification', adminNotificationSchema)
