import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/apiError.js'
import User from '../models/User.js'
import { cloudinary } from '../config/cloudinary.js'
import { isProfileComplete } from '../utils/profileCompletion.js'

export const updateProfile = asyncHandler(async (req, res) => {
  const { name, iit, branch, batch, bio } = req.body

  const user = await User.findById(req.user._id)
  if (!user) throw new ApiError(404, 'User not found')

  const nextProfile = {
    ...user.profile.toObject(),
    name: name ?? user.profile.name,
    iit: iit ?? user.profile.iit,
    branch: branch ?? user.profile.branch,
    batch: batch ?? user.profile.batch,
    bio: bio ?? user.profile.bio
  }

  // Reject incomplete student submissions before uploading or replacing any photo.
  if (user.role !== 'admin') {
    const requiredFieldsPresent = Boolean(
      typeof nextProfile.name === 'string' && nextProfile.name.trim() &&
      typeof nextProfile.iit === 'string' && nextProfile.iit.trim() &&
      typeof nextProfile.branch === 'string' && nextProfile.branch.trim() &&
      typeof nextProfile.batch === 'string' && nextProfile.batch.trim() &&
      (req.file || nextProfile.photoUrl)
    )
    if (!requiredFieldsPresent) {
      throw new ApiError(
        400,
        'Complete your profile: name, IIT, branch, batch and profile photo are required'
      )
    }
  }

  user.profile.name = nextProfile.name
  user.profile.iit = nextProfile.iit
  user.profile.branch = nextProfile.branch
  user.profile.batch = nextProfile.batch
  user.profile.bio = nextProfile.bio

  let oldPhotoPublicId = null
  if (req.file) {
    const base64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`
    const uploaded = await cloudinary.uploader.upload(base64, {
      folder: 'iit-connect/profile',
      resource_type: 'image'
    })

    oldPhotoPublicId = user.profile.photoPublicId || null
    user.profile.photoUrl = uploaded.secure_url
    user.profile.photoPublicId = uploaded.public_id
  }

  await user.save()

  // Delete the previous Cloudinary image only after the new profile has been saved.
  if (oldPhotoPublicId) {
    try {
      await cloudinary.uploader.destroy(oldPhotoPublicId)
    } catch {
      // Old-image cleanup failure must not undo a successful profile update.
    }
  }

  res.json({
    success: true,
    profile: user.profile,
    profileComplete: user.role === 'admin' || isProfileComplete(user)
  })
})
