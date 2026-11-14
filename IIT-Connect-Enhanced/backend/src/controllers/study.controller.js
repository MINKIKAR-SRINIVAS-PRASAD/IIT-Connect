import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/apiError.js'
import StudyPost from '../models/StudyPost.js'
import { createContentDeletionNotification } from '../utils/contentDeletion.js'

export const createStudyPost = asyncHandler(async (req, res) => {
  const { title, description, tags, iit, links, subject, semester, branch, resourceType } = req.body

  if (!title?.trim() || !subject?.trim()) throw new ApiError(400, 'Title and subject are required')
  if (title.length > 120 || subject.length > 80 || (description || '').length > 2000) {
    throw new ApiError(400, 'One or more fields exceed the allowed length')
  }
  if (!Array.isArray(links || []) || (links || []).length > 10 || (links || []).some((url) => typeof url !== 'string' || !/^https?:\/\//i.test(url))) {
    throw new ApiError(400, 'Provide up to 10 valid HTTP or HTTPS resource links')
  }

  const post = await StudyPost.create({
    authorId: req.user._id,
    title: title.trim(),
    description: (description || '').trim(),
    tags: Array.isArray(tags) ? tags.slice(0, 12).map((tag) => String(tag).trim().slice(0, 40)) : [],
    iit: String(iit || '').trim().slice(0, 100),
    links: links || [],
    subject: subject.trim(),
    semester: String(semester || '').trim().slice(0, 30),
    branch: String(branch || '').trim().slice(0, 80),
    resourceType: resourceType || 'Other',
    status: 'Pending'
  })

  res.status(201).json({ success: true, post })
})

export const listApprovedStudy = asyncHandler(async (req, res) => {
  const { subject, branch, semester } = req.query
  const filter = { status: 'Approved' }
  if (subject) filter.subject = subject
  if (branch) filter.branch = branch
  if (semester) filter.semester = semester

  const posts = await StudyPost.find(filter)
    .sort({ createdAt: -1 })
    .limit(100)
    .populate('authorId', 'profile.name profile.iit profile.photoUrl')

  res.json({ success: true, posts })
})

export const listMyStudy = asyncHandler(async (req, res) => {
  const posts = await StudyPost.find({ authorId: req.user._id, status: { $ne: 'Deleted' } })
    .sort({ createdAt: -1 })
    .limit(60)

  res.json({ success: true, posts })
})

export const deleteMyStudyPost = asyncHandler(async (req, res) => {
  const post = await StudyPost.findOne({
    _id: req.params.id,
    authorId: req.user._id,
    status: { $ne: 'Deleted' }
  })
  if (!post) throw new ApiError(404, 'Study resource not found or you do not own it')

  await createContentDeletionNotification({
    userId: req.user._id,
    post,
    contentType: 'Study',
    contentTitle: post.title
  })

  post.status = 'Deleted'
  post.deletedAt = new Date()
  post.deletedBy = req.user._id
  await post.save()

  res.json({ success: true, message: 'Study resource deleted for everyone' })
})
