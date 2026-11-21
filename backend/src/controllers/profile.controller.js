import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/apiError.js'
import User from '../models/User.js'
import { getIitForEmail } from '../utils/allowedIitDomains.js'
import { cloudinary } from '../config/cloudinary.js'

export const updateProfile = asyncHandler(async (req, res) => {
  const { name, iit, branch, batch, bio } = req.body

  const user = await User.findById(req.user._id)
  if (!user) throw new ApiError(404, 'User not found')

  user.profile.name = name ?? user.profile.name
  // The institute is controlled by the verified account email, not profile input.
  user.profile.iit = getIitForEmail(user.email) || user.profile.iit
  user.profile.branch = branch ?? user.profile.branch
  user.profile.batch = batch ?? user.profile.batch
  user.profile.bio = bio ?? user.profile.bio

  // photo upload via multipart/form-data with field: photo
  if (req.file) {
    const base64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`
    const uploaded = await cloudinary.uploader.upload(base64, {
      folder: 'iit-connect/profile',
      resource_type: 'image'
    })

    // delete old if exists
    if (user.profile.photoPublicId) {
      try {
        await cloudinary.uploader.destroy(user.profile.photoPublicId)
      } catch {
        // ignore
      }
    }

    user.profile.photoUrl = uploaded.secure_url
    user.profile.photoPublicId = uploaded.public_id
  }

  await user.save()

  res.json({
    success: true,
    profile: user.profile
  })
})
