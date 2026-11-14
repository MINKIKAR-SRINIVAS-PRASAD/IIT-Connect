import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/apiError.js'
import PlacementPost from '../models/PlacementPost.js'

export const createPlacementPost = asyncHandler(async (req, res) => {
  const { companyName, role, ctc, interviewQuestions, rounds, tips } = req.body
  if (!companyName || !role) throw new ApiError(400, 'companyName and role are required')

  const post = await PlacementPost.create({
    authorId: req.user._id,
    companyName,
    role,
    ctc: ctc || '',
    interviewQuestions: Array.isArray(interviewQuestions) ? interviewQuestions : [],
    rounds: Array.isArray(rounds) ? rounds : [],
    tips: tips || '',
    status: 'Pending'
  })

  res.json({ success: true, post })
})

export const listApprovedPlacements = asyncHandler(async (req, res) => {
  const { company, role } = req.query

  const filter = { status: 'Approved' }
  if (company) filter.companyName = { $regex: String(company), $options: 'i' }
  if (role) filter.role = { $regex: String(role), $options: 'i' }

  const posts = await PlacementPost.find(filter)
    .sort({ createdAt: -1 })
    .limit(60)
    .populate('authorId', 'email profile')

  res.json({ success: true, posts })
})

export const listMyPlacements = asyncHandler(async (req, res) => {
  const posts = await PlacementPost.find({ authorId: req.user._id })
    .sort({ createdAt: -1 })
    .limit(60)

  res.json({ success: true, posts })
})
