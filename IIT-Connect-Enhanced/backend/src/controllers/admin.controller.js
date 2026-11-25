import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/apiError.js'
import { syncApprovedPostContribution } from '../utils/postAchievements.js'
import User from '../models/User.js'
import GalleryPost from '../models/GalleryPost.js'
import PlacementPost from '../models/PlacementPost.js'
import EventPost from '../models/EventPost.js'
import TravelPost from '../models/TravelPost.js'
import StudyPost from '../models/StudyPost.js'
import CampusNews from '../models/CampusNews.js'
import AdminLog from '../models/AdminLog.js'
import CommunityTrip from '../models/CommunityTrip.js'
import TransportBooking from '../models/TransportBooking.js'

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

  res.json({ success: true, user })
})

export const pendingApprovals = asyncHandler(async (req, res) => {
  const [gallery, placements, events, travel, study, campusNews, communityTrips, transportBookings] = await Promise.all([
    GalleryPost.find({ status: 'Pending' }).sort({ createdAt: -1 }).limit(100).populate('authorId', 'email profile'),
    PlacementPost.find({ status: 'Pending' }).sort({ createdAt: -1 }).limit(100).populate('authorId', 'email profile'),
    EventPost.find({ status: 'Pending' }).sort({ createdAt: -1 }).limit(100).populate('authorId', 'email profile'),
    TravelPost.find({ status: 'Pending' }).sort({ createdAt: -1 }).limit(100).populate('authorId', 'email profile'),
    StudyPost.find({ status: 'Pending' }).sort({ createdAt: -1 }).limit(100).populate('authorId', 'email profile'),
    CampusNews.find({ status: 'Pending' }).sort({ createdAt: -1 }).limit(100).populate('authorId', 'email profile')
  ])

  res.json({ success: true, gallery, placements, events, travel, study, campusNews, communityTrips, transportBookings })
})

export const approveGallery = asyncHandler(async (req, res) => {
  const { id } = req.params
  const { status, rejectionReason } = req.body

  const post = await GalleryPost.findById(id)
  if (!post) throw new ApiError(404, 'Post not found')

  post.status = status
  post.rejectionReason = status === 'Rejected' ? (rejectionReason || 'Rejected') : ''
  await post.save()

  await syncApprovedPostContribution({ authorId: post.authorId, sourceModel: 'GalleryPost', sourceId: post._id, approved: status === 'Approved' })

  await log(req.user._id, status === 'Approved' ? 'APPROVE_GALLERY' : 'REJECT_GALLERY', 'GalleryPost', post._id, {
    rejectionReason: post.rejectionReason
  })

  res.json({ success: true, post })
})

export const approvePlacement = asyncHandler(async (req, res) => {
  const { id } = req.params
  const { status, rejectionReason } = req.body

  const post = await PlacementPost.findById(id)
  if (!post) throw new ApiError(404, 'Post not found')

  post.status = status
  post.rejectionReason = status === 'Rejected' ? (rejectionReason || 'Rejected') : ''
  await post.save()

  await syncApprovedPostContribution({ authorId: post.authorId, sourceModel: 'PlacementPost', sourceId: post._id, approved: status === 'Approved' })

  await log(req.user._id, status === 'Approved' ? 'APPROVE_PLACEMENT' : 'REJECT_PLACEMENT', 'PlacementPost', post._id, {
    rejectionReason: post.rejectionReason
  })

  res.json({ success: true, post })
})

export const approveEvent = asyncHandler(async (req, res) => {
  const { id } = req.params
  const { status, rejectionReason } = req.body

  const post = await EventPost.findById(id)
  if (!post) throw new ApiError(404, 'Post not found')

  post.status = status
  post.rejectionReason = status === 'Rejected' ? (rejectionReason || 'Rejected') : ''
  await post.save()

  await syncApprovedPostContribution({ authorId: post.authorId, sourceModel: 'EventPost', sourceId: post._id, approved: status === 'Approved' })

  await log(req.user._id, status === 'Approved' ? 'APPROVE_EVENT' : 'REJECT_EVENT', 'EventPost', post._id, {
    rejectionReason: post.rejectionReason
  })

  res.json({ success: true, post })
})

export const approveTravel = asyncHandler(async (req, res) => {
  const { id } = req.params
  const { status, rejectionReason } = req.body

  const post = await TravelPost.findById(id)
  if (!post) throw new ApiError(404, 'Post not found')

  post.status = status
  post.rejectionReason = status === 'Rejected' ? (rejectionReason || 'Rejected') : ''
  await post.save()

  await syncApprovedPostContribution({ authorId: post.authorId, sourceModel: 'TravelPost', sourceId: post._id, approved: status === 'Approved' })

  await log(req.user._id, status === 'Approved' ? 'APPROVE_TRAVEL' : 'REJECT_TRAVEL', 'TravelPost', post._id, {
    rejectionReason: post.rejectionReason
  })

  res.json({ success: true, post })
})

export const approveStudy = asyncHandler(async (req, res) => {
  const { id } = req.params
  const { status, rejectionReason } = req.body

  const post = await StudyPost.findById(id)
  if (!post) throw new ApiError(404, 'Post not found')

  post.status = status
  post.rejectionReason = status === 'Rejected' ? (rejectionReason || 'Rejected') : ''
  await post.save()

  await syncApprovedPostContribution({ authorId: post.authorId, sourceModel: 'StudyPost', sourceId: post._id, approved: status === 'Approved' })

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
 await syncApprovedPostContribution({ authorId: post.authorId, sourceModel: 'CampusNews', sourceId: post._id, approved: status === 'Approved' })
 await log(req.user._id,status==='Approved'?'APPROVE_CAMPUS_NEWS':'REJECT_CAMPUS_NEWS','CampusNews',post._id,{rejectionReason:post.rejectionReason})
 res.json({success:true,post})
})
export const approveCommunityTrip = asyncHandler(async (req, res) => {
  const { status, rejectionReason } = req.body
  if (!['Approved', 'Rejected'].includes(status)) throw new ApiError(400, 'Status must be Approved or Rejected')
  const trip = await CommunityTrip.findById(req.params.id)
  if (!trip) throw new ApiError(404, 'Trip not found')
  trip.approvalStatus = status
  trip.rejectionReason = status === 'Rejected' ? (rejectionReason || 'Rejected') : ''
  await trip.save()
  await log(req.user._id, status === 'Approved' ? 'APPROVE_COMMUNITY_TRIP' : 'REJECT_COMMUNITY_TRIP', 'CommunityTrip', trip._id, { rejectionReason: trip.rejectionReason })
  res.json({ success: true, trip })
})

export const approveTransportBooking = asyncHandler(async (req, res) => {
  const { status, rejectionReason } = req.body
  if (!['Approved', 'Rejected'].includes(status)) throw new ApiError(400, 'Status must be Approved or Rejected')
  const booking = await TransportBooking.findById(req.params.id)
  if (!booking) throw new ApiError(404, 'Transport booking not found')
  booking.approvalStatus = status
  booking.rejectionReason = status === 'Rejected' ? (rejectionReason || 'Rejected') : ''
  await booking.save()
  await log(req.user._id, status === 'Approved' ? 'APPROVE_TRANSPORT_BOOKING' : 'REJECT_TRANSPORT_BOOKING', 'TransportBooking', booking._id, { rejectionReason: booking.rejectionReason })
  res.json({ success: true, booking })
})

export const logs = asyncHandler(async (req, res) => {
  const items = await AdminLog.find({}).sort({ createdAt: -1 }).limit(200).populate('adminId', 'email profile')
  res.json({ success: true, logs: items })
})


export const listFacultyRequests = asyncHandler(async (_req, res) => {
  const requests = await User.find({ role: 'faculty', facultyAccessStatus: 'pending' })
    .select('email role facultyAccessStatus profile createdAt')
    .sort({ createdAt: 1 }).limit(200).lean()
  res.json({ success: true, requests })
})

export const reviewFacultyRequest = asyncHandler(async (req, res) => {
  const decision = String(req.body.decision || '').toLowerCase()
  if (!['approve', 'reject'].includes(decision)) throw new ApiError(400, 'Decision must be approve or reject')
  const user = await User.findById(req.params.id)
  if (!user || user.role !== 'faculty') throw new ApiError(404, 'Faculty request not found')
  if (user.facultyAccessStatus !== 'pending') throw new ApiError(409, 'This faculty request has already been reviewed')
  user.facultyAccessStatus = decision === 'approve' ? 'approved' : 'rejected'
  await user.save()
  await log(req.user._id, decision === 'approve' ? 'APPROVE_FACULTY_ACCESS' : 'REJECT_FACULTY_ACCESS', 'User', user._id)
  res.json({ success: true, request: { id: user._id, email: user.email, facultyAccessStatus: user.facultyAccessStatus } })
})
