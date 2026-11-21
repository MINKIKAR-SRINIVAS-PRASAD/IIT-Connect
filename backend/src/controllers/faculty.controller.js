import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/apiError.js'
import FacultyPost from '../models/FacultyPost.js'
import FacultyMessage from '../models/FacultyMessage.js'

export const listPosts = asyncHandler(async (req, res) => {
  const section = String(req.query.section || '')
  if (!['event', 'gallery', 'study'].includes(section)) throw new ApiError(400, 'Invalid faculty section')
  const posts = await FacultyPost.find({ section }).sort({ createdAt: -1 }).limit(100).populate('facultyId', 'email profile.name').lean()
  res.json({ success: true, posts })
})
export const createPost = asyncHandler(async (req, res) => {
  const { section, title, description, imageUrl, link } = req.body
  if (!['event', 'gallery', 'study'].includes(section) || !String(title || '').trim()) throw new ApiError(400, 'Section and title are required')
  const post = await FacultyPost.create({ facultyId: req.user._id, section, title: String(title).trim(), description: description || '', imageUrl: imageUrl || '', link: link || '' })
  res.status(201).json({ success: true, post })
})
export const deletePost = asyncHandler(async (req, res) => {
  const post = await FacultyPost.findById(req.params.id)
  if (!post) throw new ApiError(404, 'Faculty post not found')
  if (post.facultyId.toString() !== req.user._id.toString() && req.user.role !== 'admin') throw new ApiError(403, 'You can only remove your own post')
  await post.deleteOne()
  res.json({ success: true })
})
export const listMessages = asyncHandler(async (_req, res) => {
  const messages = await FacultyMessage.find().sort({ createdAt: 1 }).limit(300).populate('facultyId', 'email profile.name').lean()
  res.json({ success: true, messages })
})
export const sendMessage = asyncHandler(async (req, res) => {
  const text = String(req.body.text || '').trim()
  if (!text) throw new ApiError(400, 'Message is required')
  const message = await FacultyMessage.create({ facultyId: req.user._id, name: req.user.profile?.name || req.user.email.split('@')[0], text: text.slice(0, 2000) })
  res.status(201).json({ success: true, message })
})
