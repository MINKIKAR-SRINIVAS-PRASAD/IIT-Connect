import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/apiError.js'
import User from '../models/User.js'
import GalleryPost from '../models/GalleryPost.js'
import PlacementPost from '../models/PlacementPost.js'
import EventPost from '../models/EventPost.js'
import TravelPost from '../models/TravelPost.js'
import StudyPost from '../models/StudyPost.js'
import CampusNews from '../models/CampusNews.js'
import AdminLog from '../models/AdminLog.js'
import AdminNotification from '../models/AdminNotification.js'

async function log(adminId, action, targetType, targetId = null, metadata = {}) {
  await AdminLog.create({ adminId, action, targetType, targetId, metadata })
}

export const stats = asyncHandler(async (req, res) => {
  const [totalUsers, totalGallery, totalPlacements, totalEvents, totalTravel, totalStudy, pendingGallery, pendingPlacements, pendingEvents, pendingTravel, pendingStudy] =
    await Promise.all([
      User.countDocuments({}),
      GalleryPost.countDocuments({}),
      PlacementPost.countDocuments({}),
      EventPost.countDocuments({}),
      TravelPost.countDocuments({}),
      StudyPost.countDocuments({}),
      GalleryPost.countDocuments({ status: 'Pending' }),
      PlacementPost.countDocuments({ status: 'Pending' }),
      EventPost.countDocuments({ status: 'Pending' }),
      TravelPost.countDocuments({ status: 'Pending' }),
      StudyPost.countDocuments({ status: 'Pending' })
    ])

  res.json({
    success: true,
    stats: {
      totalUsers,
      totalPosts: totalGallery + totalPlacements + totalEvents + totalTravel + totalStudy,
      pendingApprovals: pendingGallery + pendingPlacements + pendingEvents + pendingTravel + pendingStudy,
      pendingGallery,
      pendingPlacements,
      pendingEvents,
      pendingTravel,
      pendingStudy
    }
  })
})

export const listUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select('email role isBanned profile createdAt')
  res.json({ success: true, users })
})

export const setBan = asyncHandler(async (req, res) => {
  const { userId } = req.params
  const { isBanned } = req.body

  const user = await User.findById(userId)
  if (!user) throw new ApiError(404, 'User not found')

  user.isBanned = Boolean(isBanned)
  await user.save()
  await log(req.user._id, user.isBanned ? 'BAN_USER' : 'UNBAN_USER', 'User', user._id)

  // Return only public account fields; never expose password or refresh-token hashes.
  const safeUser = await User.findById(user._id).select('email role isBanned profile createdAt')
  res.json({ success: true, user: safeUser })
})

export const pendingApprovals = asyncHandler(async (req, res) => {
  // This endpoint is admin-only. Include the submitter's institute email and
  // complete student profile so moderators can verify who sent each request.
  const submitterFields = 'email role profile.name profile.iit profile.branch profile.batch profile.bio profile.photoUrl createdAt'
  const withSubmitter = (query) => query.sort({ createdAt: -1 }).limit(100).populate('authorId', submitterFields)

  const [gallery, placements, events, travel, study, campusNews] = await Promise.all([
    withSubmitter(GalleryPost.find({ status: 'Pending' })),
    withSubmitter(PlacementPost.find({ status: 'Pending' })),
    withSubmitter(EventPost.find({ status: 'Pending' })),
    withSubmitter(TravelPost.find({ status: 'Pending' })),
    withSubmitter(StudyPost.find({ status: 'Pending' })),
    withSubmitter(CampusNews.find({ status: 'Pending' }))
  ])

  res.json({ success: true, gallery, placements, events, travel, study, campusNews })
})

export const approveGallery = asyncHandler(async (req, res) => {
  const { id } = req.params
  const { status, rejectionReason } = req.body
  if (!['Approved', 'Rejected'].includes(status)) {
    throw new ApiError(400, 'Status must be Approved or Rejected')
  }

  const post = await GalleryPost.findById(id)
  if (!post) throw new ApiError(404, 'Post not found')

  post.status = status
  post.rejectionReason = status === 'Rejected' ? (rejectionReason || 'Rejected') : ''
  await post.save()

  await log(req.user._id, status === 'Approved' ? 'APPROVE_GALLERY' : 'REJECT_GALLERY', 'GalleryPost', post._id, {
    rejectionReason: post.rejectionReason
  })

  res.json({ success: true, post })
})

export const approvePlacement = asyncHandler(async (req, res) => {
  const { id } = req.params
  const { status, rejectionReason } = req.body
  if (!['Approved', 'Rejected'].includes(status)) {
    throw new ApiError(400, 'Status must be Approved or Rejected')
  }

  const post = await PlacementPost.findById(id)
  if (!post) throw new ApiError(404, 'Post not found')

  post.status = status
  post.rejectionReason = status === 'Rejected' ? (rejectionReason || 'Rejected') : ''
  await post.save()

  await log(req.user._id, status === 'Approved' ? 'APPROVE_PLACEMENT' : 'REJECT_PLACEMENT', 'PlacementPost', post._id, {
    rejectionReason: post.rejectionReason
  })

  res.json({ success: true, post })
})

export const approveEvent = asyncHandler(async (req, res) => {
  const { id } = req.params
  const { status, rejectionReason } = req.body
  if (!['Approved', 'Rejected'].includes(status)) {
    throw new ApiError(400, 'Status must be Approved or Rejected')
  }

  const post = await EventPost.findById(id)
  if (!post) throw new ApiError(404, 'Post not found')

  post.status = status
  post.rejectionReason = status === 'Rejected' ? (rejectionReason || 'Rejected') : ''
  await post.save()

  await log(req.user._id, status === 'Approved' ? 'APPROVE_EVENT' : 'REJECT_EVENT', 'EventPost', post._id, {
    rejectionReason: post.rejectionReason
  })

  res.json({ success: true, post })
})

export const approveTravel = asyncHandler(async (req, res) => {
  const { id } = req.params
  const { status, rejectionReason } = req.body
  if (!['Approved', 'Rejected'].includes(status)) {
    throw new ApiError(400, 'Status must be Approved or Rejected')
  }

  const post = await TravelPost.findById(id)
  if (!post) throw new ApiError(404, 'Post not found')

  post.status = status
  post.rejectionReason = status === 'Rejected' ? (rejectionReason || 'Rejected') : ''
  await post.save()

  await log(req.user._id, status === 'Approved' ? 'APPROVE_TRAVEL' : 'REJECT_TRAVEL', 'TravelPost', post._id, {
    rejectionReason: post.rejectionReason
  })

  res.json({ success: true, post })
})

export const approveStudy = asyncHandler(async (req, res) => {
  const { id } = req.params
  const { status, rejectionReason } = req.body
  if (!['Approved', 'Rejected'].includes(status)) {
    throw new ApiError(400, 'Status must be Approved or Rejected')
  }

  const post = await StudyPost.findById(id)
  if (!post) throw new ApiError(404, 'Post not found')

  post.status = status
  post.rejectionReason = status === 'Rejected' ? (rejectionReason || 'Rejected') : ''
  await post.save()

  await log(req.user._id, status === 'Approved' ? 'APPROVE_STUDY' : 'REJECT_STUDY', 'StudyPost', post._id, {
    rejectionReason: post.rejectionReason
  })

  res.json({ success: true, post })
})

export const approveCampusNews=asyncHandler(async(req,res)=>{
 const {status,rejectionReason}=req.body
 if(!['Approved','Rejected'].includes(status))throw new ApiError(400,'Status must be Approved or Rejected')
 const post=await CampusNews.findById(req.params.id)
 if(!post)throw new ApiError(404,'Campus news not found')
 post.status=status;post.rejectionReason=status==='Rejected'?(rejectionReason||'Rejected'):''
 await post.save()
 await log(req.user._id,status==='Approved'?'APPROVE_CAMPUS_NEWS':'REJECT_CAMPUS_NEWS','CampusNews',post._id,{rejectionReason:post.rejectionReason})
 res.json({success:true,post})
})
export const logs = asyncHandler(async (req, res) => {
  const items = await AdminLog.find({}).sort({ createdAt: -1 }).limit(200).populate('adminId', 'email profile')
  res.json({ success: true, logs: items })
})


export const deletionNotifications = asyncHandler(async (req, res) => {
  const notifications = await AdminNotification.find({})
    .sort({ createdAt: -1 })
    .limit(200)
    .populate('actorId', 'email role profile.name profile.iit profile.branch profile.batch profile.photoUrl')
  res.json({ success: true, notifications })
})

export const markDeletionNotificationRead = asyncHandler(async (req, res) => {
  const notification = await AdminNotification.findByIdAndUpdate(
    req.params.id,
    { $set: { readAt: new Date() } },
    { new: true }
  )
  if (!notification) throw new ApiError(404, 'Notification not found')
  res.json({ success: true, notification })
})
