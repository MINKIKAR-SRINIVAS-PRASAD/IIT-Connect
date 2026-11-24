import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/apiError.js'
import GalleryPost from '../models/GalleryPost.js'
import FacultyGallery from '../models/FacultyGallery.js'
import { cloudinary } from '../config/cloudinary.js'
import { createContentDeletionNotification } from '../utils/contentDeletion.js'

export const createGalleryPost = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'Image is required')

  const caption = req.body.caption || ''
  const iit = req.user.profile?.iit || ''
  if (!iit) throw new ApiError(400, 'Set your IIT in profile before posting')

  const base64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`
  const uploaded = await cloudinary.uploader.upload(base64, {
    folder: 'iit-connect/gallery',
    resource_type: 'image'
  })

  const post = await GalleryPost.create({
    authorId: req.user._id,
    iit,
    caption,
    imageUrl: uploaded.secure_url,
    imagePublicId: uploaded.public_id,
    status: 'Pending'
  })

  res.json({ success: true, post })
})

export const listApprovedGallery = asyncHandler(async (req, res) => {
  // Both student and faculty submissions share one approved campus gallery.
  const [studentPosts, facultyPosts] = await Promise.all([
    GalleryPost.find({ status: 'Approved' }).sort({ createdAt: -1 }).limit(100).populate('authorId', 'email profile'),
    FacultyGallery.find({ status: 'Approved' }).sort({ createdAt: -1 }).limit(100).populate('author', 'email facultyProfile')
  ])
  const normalizedFaculty = facultyPosts.map(post => ({
    _id: post._id, imageUrl: post.imageUrl, caption: post.caption || '',
    iit: post.institute || post.author?.facultyProfile?.institute || 'Faculty',
    createdAt: post.createdAt, status: post.status, sourceType: 'FacultyGallery',
    authorId: post.author ? { _id: post.author._id, email: post.author.email, profile: {
      name: post.author.facultyProfile?.name || post.author.facultyProfile?.fullName || post.author.email,
      photoUrl: post.author.facultyProfile?.photoUrl
    }} : null
  }))
  const posts = [...studentPosts.map(post => ({...post.toObject(),sourceType:'GalleryPost'})),...normalizedFaculty]
    .sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)).slice(0,120)
  res.json({ success: true, posts })
})

export const deleteMyGalleryPost = asyncHandler(async (req, res) => {
  const post = await GalleryPost.findOne({ _id: req.params.id, authorId: req.user._id, status: { $ne: 'Deleted' } })
  if (!post) throw new ApiError(404, 'Gallery post not found or you do not own it')

  const notification = await createContentDeletionNotification({
    userId: req.user._id,
    post,
    contentType: 'Gallery',
    contentTitle: post.caption || 'Gallery photo'
  })

  post.status = 'Deleted'
  post.deletedAt = new Date()
  post.deletedBy = req.user._id
  await post.save()

  let mediaCleanupPending = false
  try {
    if (post.imagePublicId) {
      const result = await cloudinary.uploader.destroy(post.imagePublicId, { resource_type: 'image' })
      mediaCleanupPending = result?.result !== 'ok' && result?.result !== 'not found'
    }
  } catch (error) {
    mediaCleanupPending = true
    console.error('Gallery media cleanup failed:', error.message)
  }

  if (mediaCleanupPending) {
    notification.mediaCleanupPending = true
    await notification.save()
  }

  res.json({ success: true, message: 'Gallery post deleted for everyone', mediaCleanupPending })
})

export const listMyGallery = asyncHandler(async (req, res) => {
  const posts = await GalleryPost.find({ authorId: req.user._id, status: { $ne: 'Deleted' } })
    .sort({ createdAt: -1 })
    .limit(60)

  res.json({ success: true, posts })
})
