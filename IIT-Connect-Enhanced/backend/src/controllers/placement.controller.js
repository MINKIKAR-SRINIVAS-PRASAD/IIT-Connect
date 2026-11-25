import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/apiError.js'
import PlacementPost from '../models/PlacementPost.js'

export const createPlacementPost = asyncHandler(async (req, res) => {
  const { companyName, role, ctc, interviewQuestions, rounds, tips } = req.body

  const requiredText = [
    ['Company', companyName],
    ['Role', role],
    ['CTC', ctc],
    ['Tips', tips]
  ]
  const missing = requiredText.find(([, value]) => typeof value !== 'string' || !value.trim())
  if (missing) throw new ApiError(400, `${missing[0]} is required`)

  const validQuestions = Array.isArray(interviewQuestions)
    ? interviewQuestions.filter((item) => typeof item === 'string' && item.trim())
    : []
  const validRounds = Array.isArray(rounds)
    ? rounds.filter((item) => typeof item === 'string' && item.trim())
    : []

  if (!validQuestions.length) throw new ApiError(400, 'At least one interview question is required')
  if (!validRounds.length) throw new ApiError(400, 'At least one round detail is required')

  const post = await PlacementPost.create({
    authorId: req.user._id,
    companyName: companyName.trim(),
    role: role.trim(),
    ctc: ctc.trim(),
    interviewQuestions: validQuestions.map((item) => item.trim()),
    rounds: validRounds.map((item) => item.trim()),
    tips: tips.trim(),
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
