import PostContribution from '../models/PostContribution.js'
import User from '../models/User.js'

/**
 * Award one contribution point for an approved post.
 * Chat messages and private/community messages must never call this helper.
 * The unique source index makes approval retries idempotent.
 */
export async function awardApprovedPost({ authorId, sourceModel, sourceId }) {
  if (!authorId || !sourceModel || !sourceId) return null

  try {
    await PostContribution.create({ authorId, sourceModel, sourceId, points: 1 })
  } catch (error) {
    if (error?.code === 11000) return null // already awarded
    throw error
  }

  const update = await User.updateOne({ _id: authorId }, { $inc: { postStreakPoints: 1 } })
  if (!update.matchedCount) {
    await PostContribution.deleteOne({ sourceModel, sourceId })
    throw new Error('Contribution author was not found')
  }
  return { awarded: true, points: 1 }
}
