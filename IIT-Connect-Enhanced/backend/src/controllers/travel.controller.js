import { deleteOwnedContent } from '../utils/deleteOwnedContent.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/apiError.js'
import TravelPost from '../models/TravelPost.js'

export const createTravelPost = asyncHandler(async (req, res) => {
  const { name, branch, batch, travelMode, seatDetails, travelDate, from, to, notes, contactPreference } = req.body

  const iit = req.user.profile?.iit || ''
  if (!iit) throw new ApiError(400, 'Set your IIT in profile before posting')

  if (!name || !branch || !batch || !travelMode || !travelDate || !from || !to) {
    throw new ApiError(400, 'Missing required fields')
  }

  const post = await TravelPost.create({
    authorId: req.user._id,
    name,
    branch,
    batch,
    iit,
    travelMode,
    seatDetails: seatDetails || '',
    travelDate: new Date(travelDate),
    from,
    to,
    notes: notes || '',
    contactPreference: contactPreference || 'Email',
    status: 'Pending'
  })

  res.json({ success: true, post })
})

export const listApprovedTravel = asyncHandler(async (req, res) => {
  const posts = await TravelPost.find({ status: 'Approved' })
    .sort({ travelDate: 1, createdAt: -1 })
    .limit(100)
    .populate('authorId', 'email profile')

  res.json({ success: true, posts })
})

export const listMyTravel = asyncHandler(async (req, res) => {
  const posts = await TravelPost.find({ authorId: req.user._id })
    .sort({ createdAt: -1 })
    .limit(60)

  res.json({ success: true, posts })
})

export const deleteTravelSubmission = deleteOwnedContent({ Model: TravelPost, contentType: 'Travel', titleFor: post => [post.from, '→', post.to].filter(Boolean).join(' ') || 'Travel submission' })
