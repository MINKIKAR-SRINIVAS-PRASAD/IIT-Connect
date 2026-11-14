import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/apiError.js'
import StudyPost from '../models/StudyPost.js'

export const createStudyPost = asyncHandler(async (req, res) => {
  const { title, description, tags, iit, links, subject, semester, branch, resourceType } = req.body

  if (!title || !subject) {
    throw new ApiError(400, 'Title and subject are required')
  }

  const post = await StudyPost.create({
    authorId: req.user._id,
    title,
    description: description || '',
    tags: Array.isArray(tags) ? tags : [],
    iit: iit || '',
    links: Array.isArray(links) ? links : [],
    subject,
    semester: semester || '',
    branch: branch || '',
    resourceType: resourceType || 'Other',
    status: 'Pending'
  })

  res.json({ success: true, post })
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
    .populate('authorId', 'email profile')

  res.json({ success: true, posts })
})

export const listMyStudy = asyncHandler(async (req, res) => {
  const posts = await StudyPost.find({ authorId: req.user._id })
    .sort({ createdAt: -1 })
    .limit(60)

  res.json({ success: true, posts })
})
