import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/apiError.js'
import FacultyPost from '../models/FacultyPost.js'
import FacultyMessage from '../models/FacultyMessage.js'
import User from '../models/User.js'

const facultySections = ['publications', 'placement', 'study', 'events', 'gallery', 'travel']
const sectionRoutes = ['events', 'gallery', 'study', 'publications', 'travel']
export const listSectionPosts = asyncHandler(async (req, res) => {
  const section = String(req.params.section || '')
  if (!sectionRoutes.includes(section)) throw new ApiError(400, 'Invalid faculty section')
  const posts = await FacultyPost.find({ section, $or: [{ status: 'Approved' }, { status: { $exists: false }, facultyId: req.user._id }, { facultyId: req.user._id }] }).sort({ createdAt: -1 }).limit(100).populate('facultyId', 'email profile.name').lean()
  const normalized = posts.map(post => ({ ...post, ...(post.data || {}), _id: post._id, status: post.status || 'Pending', rejectionReason: post.rejectionReason, facultyId: post.facultyId }))
  const key = ({ events: 'events', gallery: 'posts', study: 'resources', publications: 'publications', travel: 'plans' })[section]
  res.json({ success: true, [key]: normalized })
})
export const createSectionPost = asyncHandler(async (req, res) => {
  const section = String(req.params.section || '')
  if (!sectionRoutes.includes(section)) throw new ApiError(400, 'Invalid faculty section')
  const body = req.body || {}
  const title = String(body.title || body.caption || '').trim()
  if (!title) throw new ApiError(400, 'Post title is required')
  const description = String(body.description || body.abstract || body.caption || '').slice(0, 5000)
  const post = await FacultyPost.create({ facultyId: req.user._id, section, title, description, link: String(body.resourceUrl || body.registrationUrl || body.imageUrl || ''), data: body, status: 'Pending' })
  res.status(201).json({ success: true, post, message: 'Submitted successfully. Your post is pending admin approval.' })
})
export const listPosts = asyncHandler(async (req, res) => {
  const section = String(req.query.section || '')
  if (!facultySections.includes(section)) throw new ApiError(400, 'Invalid faculty section')
  const posts = await FacultyPost.find({ section, $or: [{ status: 'Approved' }, { facultyId: req.user._id }] }).sort({ createdAt: -1 }).limit(100).populate('facultyId', 'email profile.name').lean()
  res.json({ success: true, posts })
})
export const createPost = asyncHandler(async (req, res) => {
  const { section, title, description, link, data } = req.body
  if (!facultySections.includes(section) || !String(title || '').trim()) throw new ApiError(400, 'Section and title are required')
  const post = await FacultyPost.create({ facultyId: req.user._id, section, title: String(title).trim(), description: String(description || '').slice(0,5000), link: String(link || ''), data: data && typeof data === 'object' ? data : {}, status: 'Pending' })
  res.status(201).json({ success: true, post, message: 'Faculty post submitted for admin approval' })
})
export const listMessages = asyncHandler(async (_req, res) => {
  const messages = await FacultyMessage.find().sort({ createdAt: 1 }).limit(300).lean()
  res.json({ success: true, messages })
})
export const sendMessage = asyncHandler(async (req, res) => {
  const text = String(req.body.text || '').trim()
  if (!text) throw new ApiError(400, 'Message is required')
  const message = await FacultyMessage.create({ facultyId: req.user._id, name: req.user.profile?.name || req.user.email.split('@')[0], text: text.slice(0, 2000) })
  res.status(201).json({ success: true, message })
})
export const facultyDirectory = asyncHandler(async (_req, res) => {
  const faculty = await User.find({ role: 'faculty' }).select('email profile').sort({ 'profile.name': 1 }).limit(300).lean()
  res.json({ success: true, faculty })
})
