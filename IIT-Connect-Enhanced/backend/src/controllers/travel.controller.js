import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/apiError.js'
import TravelPost from '../models/TravelPost.js'
import { createContentDeletionNotification } from '../utils/contentDeletion.js'

const cleanText = (value, maxLength) => String(value || '').trim().slice(0, maxLength)
const categories = ['Trekking', 'Weekend Trips', 'Pilgrimage', 'Adventure', 'Sightseeing']

export const createTravelPost = asyncHandler(async (req, res) => {
  const profile = req.user.profile || {}
  const iit = cleanText(profile.iit, 100)
  const name = cleanText(profile.name, 100)
  const branch = cleanText(profile.branch, 100)
  const batch = cleanText(profile.batch, 20)

  if (!iit || !name || !branch || !batch) {
    throw new ApiError(400, 'Complete your student profile before posting')
  }

  const destination = cleanText(req.body.destination, 120)
  const location = cleanText(req.body.location, 120)
  const category = req.body.category
  const description = cleanText(req.body.description, 1000)
  const budget = cleanText(req.body.budget, 40)
  const members = Number(req.body.members || 1)
  const dateValue = req.body.date || req.body.travelDate || null
  const travelDate = dateValue ? new Date(dateValue) : null

  if (!destination || !location || !description) {
    throw new ApiError(400, 'Destination, location and description are required')
  }
  if (!categories.includes(category)) throw new ApiError(400, 'Choose a valid travel category')
  if (!Number.isInteger(members) || members < 1 || members > 50) {
    throw new ApiError(400, 'Maximum members must be between 1 and 50')
  }
  if (dateValue && Number.isNaN(travelDate.getTime())) {
    throw new ApiError(400, 'Enter a valid travel date')
  }

  const post = await TravelPost.create({
    authorId: req.user._id,
    name,
    branch,
    batch,
    iit,
    destination,
    location,
    category,
    description,
    budget,
    members,
    travelMode: 'Trip',
    travelDate,
    from: location,
    to: destination,
    notes: description,
    contactPreference: 'Email',
    status: 'Pending'
  })

  res.status(201).json({ success: true, post, message: 'Travel plan submitted for admin approval' })
})

export const listApprovedTravel = asyncHandler(async (req, res) => {
  const posts = await TravelPost.find({ status: 'Approved' })
    .select('-seatDetails -contactPreference -rejectionReason')
    .sort({ travelDate: 1, createdAt: -1 })
    .limit(100)
    .populate('authorId', 'profile.name profile.iit profile.branch profile.batch profile.photoUrl')

  res.json({ success: true, posts })
})

export const deleteMyTravelPost = asyncHandler(async (req, res) => {
  const post = await TravelPost.findOne({ _id: req.params.id, authorId: req.user._id, status: { $ne: 'Deleted' } })
  if (!post) throw new ApiError(404, 'Travel plan not found or you do not own it')

  await createContentDeletionNotification({
    userId: req.user._id,
    post,
    contentType: 'Travel',
    contentTitle: `${post.destination} · ${post.location}`
  })

  post.status = 'Deleted'
  post.deletedAt = new Date()
  post.deletedBy = req.user._id
  await post.save()

  res.json({ success: true, message: 'Travel plan deleted for everyone' })
})

export const listMyTravel = asyncHandler(async (req, res) => {
  const posts = await TravelPost.find({ authorId: req.user._id, status: { $ne: 'Deleted' } })
    .sort({ createdAt: -1 })
    .limit(60)

  res.json({ success: true, posts })
})
