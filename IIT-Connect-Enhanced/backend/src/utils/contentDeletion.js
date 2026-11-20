import User from '../models/User.js'
import AdminNotification from '../models/AdminNotification.js'
import { ApiError } from './apiError.js'
import { notifyAdminsOfContentDeletion } from '../socket/index.js'

export async function createContentDeletionNotification({ userId, post, contentType, contentTitle }) {
  const actor = await User.findById(userId).select('email profile')
  if (!actor) throw new ApiError(404, 'Student account not found')

  const notification = await AdminNotification.create({
    type: 'CONTENT_DELETED',
    contentType,
    contentId: post._id,
    contentTitle: String(contentTitle || 'Untitled submission').slice(0, 200),
    actorId: actor._id,
    actorEmail: actor.email,
    actorName: actor.profile?.name || '',
    institute: actor.profile?.iit || post.iit || '',
    contentSnapshot: post.toObject()
  })

  notifyAdminsOfContentDeletion({
    _id: notification._id,
    type: notification.type,
    contentType: notification.contentType,
    contentTitle: notification.contentTitle,
    actorEmail: notification.actorEmail,
    actorName: notification.actorName,
    institute: notification.institute,
    createdAt: notification.createdAt
  })

  return notification
}
