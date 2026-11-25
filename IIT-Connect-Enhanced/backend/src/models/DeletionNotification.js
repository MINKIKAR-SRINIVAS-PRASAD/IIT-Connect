import mongoose from 'mongoose'

const deletionNotificationSchema = new mongoose.Schema({
  actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  actorName: { type: String, default: '' },
  actorEmail: { type: String, required: true },
  institute: { type: String, default: '' },
  contentType: { type: String, enum: ['Gallery', 'Study', 'Travel'], required: true },
  contentId: { type: String, required: true },
  contentTitle: { type: String, default: '' },
  contentSnapshot: { type: mongoose.Schema.Types.Mixed, default: {} },
  mediaCleanupPending: { type: Boolean, default: false },
  readAt: { type: Date, default: null, index: true }
}, { timestamps: true })

deletionNotificationSchema.index({ createdAt: -1 })
export default mongoose.model('DeletionNotification', deletionNotificationSchema)
