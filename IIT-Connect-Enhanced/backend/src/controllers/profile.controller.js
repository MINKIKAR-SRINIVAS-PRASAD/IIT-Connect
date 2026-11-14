import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/apiError.js'
import User from '../models/User.js'
import { cloudinary } from '../config/cloudinary.js'
import { isProfileComplete } from '../utils/profileCompletion.js'

export const updateProfile = asyncHandler(async (req, res) => {
  const { name, iit, branch, batch, bio } = req.body

  const user = await User.findById(req.user._id)
  if (!user) throw new ApiError(404, 'User not found')

  user.profile.name = name ?? user.profile.name
  user.profile.iit = iit ?? user.profile.iit
  user.profile.branch = branch ?? user.profile.branch
  user.profile.batch = batch ?? user.profile.batch
  user.profile.bio = bio ?? user.profile.bio

  if (req.file) {
    const base64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`
    const uploaded = await cloudinary.uploader.upload(base64, {
      folder: 'iit-connect/profile',
      resource_type: 'image'
    })

    if (user.profile.photoPublicId) {
      try {
        await cloudinary.uploader.destroy(user.profile.photoPublicId)
      } catch {
        // Keep the profile update successful if old-image cleanup fails.
      }
    }

    user.profile.photoUrl = uploaded.secure_url
    user.profile.photoPublicId = uploaded.public_id
  }

  // Students must complete all required fields and upload a profile photo.
  // Admins are provisioned separately and are exempt from onboarding requirements.
  if (user.role !== 'admin' && !isProfileComplete(user)) {
    throw new ApiError(
      400,
      'Complete your profile: name, IIT, branch, batch and profile photo are required'
    )
  }

  await user.save()

  res.json({
    success: true,
    profile: user.profile,
    profileComplete: user.role === 'admin' || isProfileComplete(user)
  })
})
