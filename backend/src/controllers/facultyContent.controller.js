import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/apiError.js'
import FacultyContent from '../models/FacultyContent.js'
import { cloudinary } from '../config/cloudinary.js'

const sections = new Set(['events','gallery','study','publications','travel'])
const ownFilter = req => ({ facultyId: req.user._id })

export const listFacultyContent = asyncHandler(async (req, res) => {
  const section = String(req.query.section || '')
  if (!sections.has(section)) throw new ApiError(400, 'Invalid faculty section')
  const posts = await FacultyContent.find({ section, ...ownFilter(req) }).sort({ createdAt: -1 }).limit(100).lean()
  res.json({ success: true, posts })
})

export const createFacultyContent = asyncHandler(async (req, res) => {
  const section = String(req.body.section || '')
  if (!sections.has(section)) throw new ApiError(400, 'Invalid faculty section')
  const title = String(req.body.title || req.body.caption || '').trim()
  if (section !== 'gallery' && !title) throw new ApiError(400, 'Title is required')
  if (section === 'gallery' && !req.file) throw new ApiError(400, 'Choose an image to upload')

  let mediaUrl = '', mediaPublicId = ''
  if (req.file) {
    if (!req.file.mimetype?.startsWith('image/')) throw new ApiError(400, 'Only image files are supported')
    const dataUri = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`
    const upload = await cloudinary.uploader.upload(dataUri, { folder: 'iit-connect/faculty', resource_type: 'image' })
    mediaUrl = upload.secure_url
    mediaPublicId = upload.public_id
  }

  const dateValue = req.body.date ? new Date(req.body.date) : null
  if (dateValue && Number.isNaN(dateValue.getTime())) throw new ApiError(400, 'Invalid date')
  const post = await FacultyContent.create({
    facultyId: req.user._id, section, title,
    description: String(req.body.description || req.body.abstract || req.body.caption || '').slice(0,10000),
    category: String(req.body.category || req.body.publicationType || '').slice(0,100),
    subject: String(req.body.subject || '').slice(0,200),
    institute: String(req.body.institute || req.user.facultyProfile?.institute || '').slice(0,200),
    department: String(req.body.department || req.user.facultyProfile?.department || '').slice(0,200),
    date: dateValue, venue: String(req.body.venue || '').slice(0,300),
    from: String(req.body.from || '').slice(0,200), destination: String(req.body.destination || req.body.to || '').slice(0,200),
    url: String(req.body.url || req.body.resourceUrl || req.body.registrationUrl || '').slice(0,2000),
    mediaUrl, mediaPublicId, status: 'Pending'
  })
  res.status(201).json({ success: true, post })
})

export const deleteFacultyContent = asyncHandler(async (req, res) => {
  const post = await FacultyContent.findOneAndDelete({ _id: req.params.id, ...ownFilter(req) })
  if (!post) throw new ApiError(404, 'Faculty post not found')
  if (post.mediaPublicId) {
    try { await cloudinary.uploader.destroy(post.mediaPublicId, { resource_type: 'image' }) } catch {}
  }
  res.json({ success: true })
})
