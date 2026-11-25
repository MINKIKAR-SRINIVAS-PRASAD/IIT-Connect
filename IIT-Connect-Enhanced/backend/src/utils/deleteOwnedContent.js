import { asyncHandler } from './asyncHandler.js'
import { ApiError } from './apiError.js'
import DeletionNotification from '../models/DeletionNotification.js'
import { cloudinary } from '../config/cloudinary.js'

export function deleteOwnedContent({ Model, contentType, titleFor, imageIdField = null }) {
  return asyncHandler(async (req, res) => {
    const item = await Model.findOne({ _id: req.params.id, authorId: req.user._id })
    if (!item) throw new ApiError(404, 'Submission not found or you do not own it')
    const snapshot = item.toObject()
    const notification = await DeletionNotification.create({
      actorId: req.user._id, actorName: req.user.profile?.name || '',
      actorEmail: req.user.email,
      institute: req.user.profile?.iit || req.user.profile?.institute || item.iit || '',
      contentType, contentId: String(item._id), contentTitle: titleFor(item),
      contentSnapshot: snapshot, mediaCleanupPending: false
    })
    try { await item.deleteOne() } catch (error) {
      await DeletionNotification.deleteOne({ _id: notification._id })
      throw error
    }
    if (imageIdField && item[imageIdField]) {
      try { await cloudinary.uploader.destroy(item[imageIdField], { resource_type: 'image' }) }
      catch (error) {
        notification.mediaCleanupPending = true
        await notification.save()
        console.error('Cloudinary cleanup pending:', error.message)
      }
    }
    res.json({ success: true, deletedId: String(item._id), notificationId: String(notification._id) })
  })
}
