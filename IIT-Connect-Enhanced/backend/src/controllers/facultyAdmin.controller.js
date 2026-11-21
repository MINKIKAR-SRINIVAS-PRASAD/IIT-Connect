import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/apiError.js'
import User from '../models/User.js'
import AdminLog from '../models/AdminLog.js'

export const pendingFacultyRequests = asyncHandler(async (req, res) => {
  const requests = await User.find({ role: 'faculty', facultyVerified: false, facultyRequestStatus: 'pending' })
    .select('email facultyProfile facultyRequestStatus createdAt')
    .sort({ createdAt: 1 })
    .limit(200)
  res.json({ success: true, requests })
})

export const reviewFacultyRequest = asyncHandler(async (req, res) => {
  const { decision } = req.body
  if (!['approve', 'reject'].includes(decision)) throw new ApiError(400, 'Decision must be approve or reject')
  const user = await User.findById(req.params.userId)
  if (!user || user.role !== 'faculty' || user.facultyRequestStatus !== 'pending') throw new ApiError(404, 'Pending faculty request not found')
  if (decision === 'approve') {
    user.facultyVerified = true
    user.facultyRequestStatus = 'approved'
  } else {
    user.facultyVerified = false
    user.facultyRequestStatus = 'rejected'
    user.role = 'student'
  }
  await user.save()
  await AdminLog.create({ adminId: req.user._id, action: decision === 'approve' ? 'APPROVE_FACULTY' : 'REJECT_FACULTY', targetType: 'User', targetId: user._id })
  res.json({ success: true, request: { id: user._id, role: user.role, facultyVerified: user.facultyVerified, facultyRequestStatus: user.facultyRequestStatus } })
})
