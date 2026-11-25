import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/apiError.js'
import EventPost from '../models/EventPost.js'
import { cloudinary } from '../config/cloudinary.js'
import { deleteOwnedContent } from '../utils/deleteOwnedContent.js'

export const createEvent = asyncHandler(async (req, res) => {
  const { iit, title, datetime, venue, registrationLink, description } = req.body
  if (!iit || !title || !datetime) throw new ApiError(400, 'iit, title, datetime are required')

  let posterUrl = ''
  let posterPublicId = ''

  if (req.file) {
    const base64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`
    const uploaded = await cloudinary.uploader.upload(base64, {
      folder: 'iit-connect/events',
      resource_type: 'image'
    })
    posterUrl = uploaded.secure_url
    posterPublicId = uploaded.public_id
  }

  const post = await EventPost.create({
    authorId: req.user._id,
    iit,
    title,
    datetime: new Date(datetime),
    venue: venue || '',
    posterUrl,
    posterPublicId,
    registrationLink: registrationLink || '',
    description: description || '',
    status: 'Pending'
  })

  res.json({ success: true, post })
})

export const listApprovedEvents = asyncHandler(async (req, res) => {
  const now = new Date()
  const upcoming = await EventPost.find({ status: 'Approved', datetime: { $gte: now } })
    .sort({ datetime: 1 })
    .limit(60)

  const past = await EventPost.find({ status: 'Approved', datetime: { $lt: now } })
    .sort({ datetime: -1 })
    .limit(60)

  res.json({ success: true, upcoming, past })
})

export const myEvents = asyncHandler(async (req, res) => {
  const posts = await EventPost.find({ authorId: req.user._id })
    .sort({ createdAt: -1 })
    .limit(60)

  res.json({ success: true, posts })
})

export const deleteEvent = deleteOwnedContent({ Model: EventPost, contentType: 'Event', titleFor: post => post.title || 'Event', imageIdField: 'posterPublicId' })
