import { deleteOwnedContent } from '../utils/deleteOwnedContent.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/apiError.js'
import GalleryPost from '../models/GalleryPost.js'
import { cloudinary } from '../config/cloudinary.js'

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
  const posts = await GalleryPost.find({ status: 'Approved' })
    .sort({ createdAt: -1 })
    .limit(60)
    .populate('authorId', 'email profile')

  res.json({ success: true, posts })
})

export const listMyGallery = asyncHandler(async (req, res) => {
  const posts = await GalleryPost.find({ authorId: req.user._id })
    .sort({ createdAt: -1 })
    .limit(60)

  res.json({ success: true, posts })
})

export const deleteGallerySubmission = deleteOwnedContent({ Model: GalleryPost, contentType: 'Gallery', titleFor: post => post.caption || 'Gallery image', imageIdField: 'imagePublicId' })
