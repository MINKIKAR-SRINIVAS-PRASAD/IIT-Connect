import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/apiError.js'
import FacultyPost from '../models/FacultyPost.js'
import FacultyMessage from '../models/FacultyMessage.js'
import User from '../models/User.js'
import { cloudinary } from '../config/cloudinary.js'

const facultySections = ['events', 'gallery', 'study', 'publications', 'travel', 'placement']

export const listPosts = asyncHandler(async (req, res) => {
  const section = String(req.query.section || '')
  if (section && !facultySections.includes(section)) throw new ApiError(400, 'Invalid faculty section')
  const filter = section ? { section } : {}
  const posts = await FacultyPost.find(filter).sort({ createdAt: -1 }).limit(150)
    .populate('facultyId', 'email facultyProfile profile').lean()
  res.json({ success: true, posts })
})

export const createPost = asyncHandler(async (req, res) => {
  const { section, title, description, link } = req.body
  if (!facultySections.includes(section)) throw new ApiError(400, 'Select a valid faculty section')
  if (!String(title || '').trim()) throw new ApiError(400, 'Title is required')

  let details = {}
  if (req.body.details) {
    try { details = JSON.parse(req.body.details) } catch { throw new ApiError(400, 'Post details are invalid') }
  }
  let mediaUrl = ''
  let mediaPublicId = ''
  if (req.file) {
    const base64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`
    const uploaded = await cloudinary.uploader.upload(base64, {
      folder: `iit-connect/faculty/${section}`,
      resource_type: 'auto'
    })
    mediaUrl = uploaded.secure_url
    mediaPublicId = uploaded.public_id
  }
  if (section === 'gallery' && !mediaUrl) throw new ApiError(400, 'Choose an image to upload')
  const post = await FacultyPost.create({
    facultyId: req.user._id, section, title: String(title).trim(),
    description: String(description || '').slice(0, 10000),
    link: String(link || '').trim(), details, mediaUrl, mediaPublicId
  })
  const populated = await post.populate('facultyId', 'email facultyProfile profile')
  res.status(201).json({ success: true, post: populated })
})

export const deletePost = asyncHandler(async (req, res) => {
  const post = await FacultyPost.findOne({ _id: req.params.id, facultyId: req.user._id })
  if (!post) throw new ApiError(404, 'Faculty post not found or not owned by you')
  await post.deleteOne()
  res.json({ success: true })
})

export const listMessages = asyncHandler(async (_req, res) => {
  const messages = await FacultyMessage.find().sort({ createdAt: 1 }).limit(300).lean()
  res.json({ success: true, messages })
})
export const sendMessage = asyncHandler(async (req, res) => {
  const text = String(req.body.text || '').trim()
  if (!text) throw new ApiError(400, 'Message is required')
  const message = await FacultyMessage.create({ facultyId: req.user._id, name: req.user.facultyProfile?.name || req.user.email.split('@')[0], text: text.slice(0, 2000) })
  res.status(201).json({ success: true, message })
})
export const facultyDirectory = asyncHandler(async (_req, res) => {
  const faculty = await User.find({ role: 'faculty', facultyVerified: true }).select('email facultyProfile').sort({ 'facultyProfile.name': 1 }).limit(300).lean()
  res.json({ success: true, faculty })
})
