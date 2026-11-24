import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/apiError.js'
import User from '../models/User.js'
import GalleryPost from '../models/GalleryPost.js'
import EventPost from '../models/EventPost.js'
import CampusNews from '../models/CampusNews.js'
import PlacementPost from '../models/PlacementPost.js'
import StudyPost from '../models/StudyPost.js'
import TravelPost from '../models/TravelPost.js'

export const getPublicStudentProfile = asyncHandler(async (req, res) => {
  const user = await User.findOne({ _id: req.params.userId, role: 'student', isBanned: { $ne: true } }).select('_id role profile createdAt')
  if (!user) throw new ApiError(404, 'Student profile not found')
  const authorId = user._id
  const approved = { authorId, status: 'Approved' }
  const [gallery, events, news, placements, study, travel] = await Promise.all([
    GalleryPost.find(approved).sort({ createdAt: -1 }).limit(60).select('caption imageUrl iit createdAt status'),
    EventPost.find(approved).sort({ createdAt: -1 }).limit(60).select('title description posterUrl datetime venue iit createdAt status'),
    CampusNews.find(approved).sort({ createdAt: -1 }).limit(60).select('title body category institute sourceUrl createdAt status'),
    PlacementPost.find(approved).sort({ createdAt: -1 }).limit(60).select('companyName role ctc tips createdAt status'),
    StudyPost.find(approved).sort({ createdAt: -1 }).limit(60).select('title description subject semester branch resourceType links tags createdAt status'),
    TravelPost.find(approved).sort({ createdAt: -1 }).limit(60).select('destination location category description budget travelDate from to createdAt status')
  ])
  const sections = [
    ...gallery.map(post => ({ ...post.toObject(), section: 'Gallery', type: 'image', text: post.caption })),
    ...events.map(post => ({ ...post.toObject(), section: 'Events', type: 'event', text: post.description })),
    ...news.map(post => ({ ...post.toObject(), section: 'Campus News', type: 'news', text: post.body })),
    ...placements.map(post => ({ ...post.toObject(), section: 'Placements', type: 'placement', text: [post.role, post.ctc, post.tips].filter(Boolean).join(' • ') })),
    ...study.map(post => ({ ...post.toObject(), section: 'Study Hub', type: 'study', text: post.description })),
    ...travel.map(post => ({ ...post.toObject(), section: 'Travel', type: 'travel', text: post.description }))
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  res.json({ success: true, profile: {
    id: String(user._id), name: user.profile?.name || 'Student',
    photoUrl: user.profile?.photoUrl || '', rollNumber: user.profile?.rollNumber || '',
    institute: user.profile?.iit || '', branch: user.profile?.branch || '',
    batch: user.profile?.batch || '', bio: user.profile?.bio || '',
    joinedAt: user.createdAt
  }, posts: sections })
})
