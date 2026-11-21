import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/apiError.js'
import User from '../models/User.js'
import { cloudinary } from '../config/cloudinary.js'
import { isProfileComplete } from '../utils/profileCompletion.js'
import { getIitNameFromEmail } from '../utils/allowedIitDomains.js'

export const updateProfile = asyncHandler(async (req, res) => {
  const { name, rollNumber, iit, branch, batch, bio } = req.body

  const user = await User.findById(req.user._id)
  if (!user) throw new ApiError(404, 'User not found')

  const nextName = name ?? user.profile.name
  // Students cannot choose or spoof their institute: the OTP-verified email domain is authoritative.
  const verifiedInstitute = user.role === 'student' ? getIitNameFromEmail(user.email) : ''
  const nextIit = verifiedInstitute || iit || user.profile.iit
  const nextBranch = branch ?? user.profile.branch
  const nextBatch = batch ?? user.profile.batch
  const nextBio = bio ?? user.profile.bio

  // Reject incomplete student submissions before uploading or replacing any photo.
  if (user.role !== 'admin') {
    const requiredFieldsPresent = Boolean(
      typeof nextName === 'string' && nextName.trim() &&
      typeof nextIit === 'string' && nextIit.trim() &&
      typeof nextBranch === 'string' && nextBranch.trim() &&
      typeof nextBatch === 'string' && nextBatch.trim() &&
      (req.file || user.profile.photoUrl)
    )
    if (!requiredFieldsPresent) {
      throw new ApiError(
        400,
        'Complete your profile: name, IIT, branch, batch and profile photo are required'
      )
    }
  }

  user.profile.name = nextName
  if (rollNumber !== undefined) user.profile.rollNumber = String(rollNumber).trim().toUpperCase()
  user.profile.iit = nextIit
  user.profile.branch = nextBranch
  user.profile.batch = nextBatch
  user.profile.bio = nextBio

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
