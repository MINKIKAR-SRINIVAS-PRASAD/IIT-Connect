import PostContribution from '../models/PostContribution.js'
import User from '../models/User.js'

export async function syncApprovedPostContribution({ authorId, sourceModel, sourceId, approved }) {
  if (!authorId || !sourceModel || !sourceId) return
  if (approved) {
    try {
      await PostContribution.create({ authorId, sourceModel, sourceId, points: 1 })
    } catch (error) {
      if (error?.code === 11000) return
      throw error
    }
    const result = await User.updateOne({ _id: authorId }, { $inc: { postStreakPoints: 1 } })
    if (!result.matchedCount) {
      await PostContribution.deleteOne({ sourceModel, sourceId })
      throw new Error('Contribution author was not found')
    }
    return
  }
  const existing = await PostContribution.findOneAndDelete({ sourceModel, sourceId })
  if (existing) {
    await User.updateOne({ _id: existing.authorId }, { $inc: { postStreakPoints: -existing.points } })
    await User.updateOne({ _id: existing.authorId, postStreakPoints: { $lt: 0 } }, { $set: { postStreakPoints: 0 } })
  }
}
