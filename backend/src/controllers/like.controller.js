import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/apiError.js'
import Like from '../models/Like.js'

export const toggleLike = asyncHandler(async (req, res) => {
  const { targetType, targetId } = req.body
  if (!targetType || !targetId) throw new ApiError(400, 'targetType and targetId required')

  const existing = await Like.findOne({ userId: req.user._id, targetType, targetId })
  if (existing) {
    await Like.deleteOne({ _id: existing._id })
    return res.json({ success: true, liked: false })
  }

  await Like.create({ userId: req.user._id, targetType, targetId })
  res.json({ success: true, liked: true })
})

export const countLikes = asyncHandler(async (req, res) => {
  const { targetType, targetId } = req.query
  if (!targetType || !targetId) throw new ApiError(400, 'targetType and targetId required')

  const count = await Like.countDocuments({ targetType, targetId })
  res.json({ success: true, count })
})
