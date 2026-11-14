import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/apiError.js'
import Comment from '../models/Comment.js'

export const addComment = asyncHandler(async (req, res) => {
  const { targetType, targetId, text } = req.body
  if (!targetType || !targetId || !text) throw new ApiError(400, 'targetType, targetId, text required')

  const c = await Comment.create({
    authorId: req.user._id,
    targetType,
    targetId,
    text
  })

  res.json({ success: true, comment: c })
})

export const listComments = asyncHandler(async (req, res) => {
  const { targetType, targetId } = req.query
  if (!targetType || !targetId) throw new ApiError(400, 'targetType and targetId required')

  const comments = await Comment.find({ targetType, targetId })
    .sort({ createdAt: -1 })
    .limit(200)
    .populate('authorId', 'email profile')

  res.json({ success: true, comments })
})
