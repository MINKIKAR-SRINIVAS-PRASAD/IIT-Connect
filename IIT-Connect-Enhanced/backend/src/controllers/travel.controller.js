import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/apiError.js'
import TravelPost from '../models/TravelPost.js'

const cleanText = (value, maxLength) => String(value || '').trim().slice(0, maxLength)

export const createTravelPost = asyncHandler(async (req, res) => {
  const { travelMode, seatDetails, travelDate, from, to, notes, contactPreference } = req.body
  const profile = req.user.profile || {}
  const iit = cleanText(profile.iit, 100)

  if (!iit) throw new ApiError(400, 'Set your IIT in profile before posting')

  const name = cleanText(profile.name, 100)
  const branch = cleanText(profile.branch, 100)
  const batch = cleanText(profile.batch, 20)
  if (!name || !branch || !batch) {
    throw new ApiError(400, 'Complete your student profile before posting')
  }

  if (!['Train', 'Flight', 'Bus'].includes(travelMode)) {
    throw new ApiError(400, 'Invalid travel mode')
  }

  const parsedDate = new Date(travelDate)
  if (!travelDate || Number.isNaN(parsedDate.getTime())) {
    throw new ApiError(400, 'A valid travel date is required')
  }

  const cleanFrom = cleanText(from, 120)
  const cleanTo = cleanText(to, 120)
  if (!cleanFrom || !cleanTo) {
    throw new ApiError(400, 'Origin and destination are required')
  }

  if (contactPreference && !['Email', 'Phone', 'WhatsApp'].includes(contactPreference)) {
    throw new ApiError(400, 'Invalid contact preference')
  }

  const post = await TravelPost.create({
    authorId: req.user._id,
    name,
    branch,
    batch,
    iit,
    travelMode,
    seatDetails: cleanText(seatDetails, 80),
    travelDate: parsedDate,
    from: cleanFrom,
    to: cleanTo,
    notes: cleanText(notes, 1000),
    contactPreference: contactPreference || 'Email',
    status: 'Pending'
  })

  res.status(201).json({ success: true, post })
})

export const listApprovedTravel = asyncHandler(async (req, res) => {
  // Seat and contact details remain private; only approved trip summaries are listed.
  const posts = await TravelPost.find({ status: 'Approved' })
    .select('-seatDetails -contactPreference')
    .sort({ travelDate: 1, createdAt: -1 })
    .limit(100)
    .populate('authorId', 'profile.name profile.iit profile.branch profile.batch')

  res.json({ success: true, posts })
})

export const listMyTravel = asyncHandler(async (req, res) => {
  const posts = await TravelPost.find({ authorId: req.user._id })
    .sort({ createdAt: -1 })
    .limit(60)

  res.json({ success: true, posts })
})
