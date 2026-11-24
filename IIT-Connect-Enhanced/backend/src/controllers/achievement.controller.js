import crypto from 'crypto'
import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/apiError.js'
import User from '../models/User.js'

const badgeFor = (points) => points >= 10000 ? 'Platinum' : points >= 5000 ? 'Gold' : points >= 1000 ? 'Silver' : 'No badge'

export const achievementSummary = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('postStreakPoints achievementCertificateId achievementCertificateIssuedAt profile.name profile.iit profile.branch profile.batch')
  if (!user) throw new ApiError(404, 'User not found')
  const points = Number(user.postStreakPoints || 0)
  const level = badgeFor(points)
  const next = points < 1000 ? 1000 : points < 5000 ? 5000 : points < 10000 ? 10000 : null
  const rewards = {
    Silver: ['Silver contribution badge on your profile', 'Silver achievement recognition'],
    Gold: ['Gold contribution badge on your profile', 'Gold achievement recognition'],
    Platinum: ['Platinum premium badge', 'Downloadable IITStudentsOS contribution certificate']
  }
  res.json({ success: true, points, level, nextMilestone: next, pointsToNext: next === null ? 0 : next - points, rewards: rewards[level] || [], certificateAvailable: points >= 10000, certificateId: user.achievementCertificateId || '' })
})

export const issueAchievementCertificate = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
  if (!user) throw new ApiError(404, 'User not found')
  if (user.role !== 'student') throw new ApiError(403, 'The internship contribution certificate is available to student accounts only')
  if (Number(user.postStreakPoints || 0) < 10000) throw new ApiError(403, 'The Platinum certificate unlocks at 10,000 approved post contribution points')
  if (!user.achievementCertificateId) {
    user.achievementCertificateId = 'IITSO-PLAT-' + crypto.randomBytes(6).toString('hex').toUpperCase()
    user.achievementCertificateIssuedAt = new Date()
    await user.save()
  }
  res.json({
    success: true,
    certificate: {
      certificateId: user.achievementCertificateId,
      issuedAt: user.achievementCertificateIssuedAt,
      studentName: user.profile?.name || 'IITStudentsOS Student',
      institute: user.profile?.iit || '',
      branch: user.profile?.branch || '',
      batch: user.profile?.batch || '',
      contributionPoints: user.postStreakPoints,
      achievement: 'Platinum'
    }
  })
})

export const verifyAchievementCertificate = asyncHandler(async (req, res) => {
  const user = await User.findOne({ achievementCertificateId: String(req.params.certificateId || '').trim() })
    .select('role achievementCertificateId achievementCertificateIssuedAt postStreakPoints profile.name profile.iit profile.branch profile.batch')
  if (!user || user.role !== 'student' || Number(user.postStreakPoints || 0) < 10000) throw new ApiError(404, 'Certificate not found or no longer eligible')
  res.json({
    success: true,
    verified: true,
    certificate: {
      certificateId: user.achievementCertificateId,
      issuedAt: user.achievementCertificateIssuedAt,
      studentName: user.profile?.name || 'IITStudentsOS Student',
      institute: user.profile?.iit || '',
      branch: user.profile?.branch || '',
      batch: user.profile?.batch || '',
      contributionPoints: user.postStreakPoints,
      achievement: 'Platinum',
      issuer: 'IITStudentsOS',
      note: 'Platform contribution recognition; not an official institute-issued academic certificate.'
    }
  })
})
