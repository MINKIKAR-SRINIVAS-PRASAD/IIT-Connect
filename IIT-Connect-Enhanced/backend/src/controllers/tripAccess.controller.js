import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/apiError.js'
import TravelPost from '../models/TravelPost.js'
import TripAccessRequest from '../models/TripAccessRequest.js'

export const requestTripAccess = asyncHandler(async (req, res) => {
  const trip = await TravelPost.findOne({ _id: req.params.id, status: 'Approved' }).select('_id authorId')
  if (!trip) throw new ApiError(404, 'Approved trip not found')
  if (String(trip.authorId) === String(req.user._id)) throw new ApiError(400, 'You already own this trip')
  const existing = await TripAccessRequest.findOne({ tripId: trip._id, requesterId: req.user._id })
  if (existing) {
    if (existing.status === 'Declined' || existing.status === 'Cancelled') {
      existing.status = 'Pending'; existing.requesterConsent = true; existing.ownerConsent = false
      await existing.save()
      return res.status(200).json({ success: true, request: existing, message: 'Access request sent again' })
    }
    return res.status(200).json({ success: true, request: existing, message: 'You already have an access request for this trip' })
  }
  const accessRequest = await TripAccessRequest.create({
    tripId: trip._id, requesterId: req.user._id, ownerId: trip.authorId,
    requesterConsent: true, ownerConsent: false, status: 'Pending'
  })
  res.status(201).json({ success: true, request: accessRequest, message: 'Request sent to the trip owner' })
})

export const listIncomingTripRequests = asyncHandler(async (req, res) => {
  const requests = await TripAccessRequest.find({ ownerId: req.user._id, status: 'Pending' })
    .sort({ createdAt: -1 })
    .populate('tripId', 'destination location travelDate travelMode from to')
    .populate('requesterId', 'email profile.name profile.iit profile.branch profile.batch profile.photoUrl')
  res.json({ success: true, requests })
})

export const listMyTripRequests = asyncHandler(async (req, res) => {
  const requests = await TripAccessRequest.find({ requesterId: req.user._id })
    .sort({ createdAt: -1 })
    .populate('tripId', 'destination location travelDate travelMode from to')
    .populate('ownerId', 'email profile.name profile.iit profile.branch profile.batch profile.photoUrl')
  res.json({ success: true, requests })
})

export const respondToTripRequest = asyncHandler(async (req, res) => {
  const { decision } = req.body
  if (!['accept', 'decline'].includes(decision)) throw new ApiError(400, 'Decision must be accept or decline')
  const accessRequest = await TripAccessRequest.findOne({ _id: req.params.requestId, ownerId: req.user._id, status: 'Pending' })
  if (!accessRequest) throw new ApiError(404, 'Pending access request not found')
  const trip = await TravelPost.findOne({ _id: accessRequest.tripId, authorId: req.user._id, status: 'Approved' })
  if (!trip) throw new ApiError(404, 'Approved trip not found')
  accessRequest.ownerConsent = decision === 'accept'
  accessRequest.status = decision === 'accept' && accessRequest.requesterConsent ? 'Accepted' : 'Declined'
  await accessRequest.save()
  res.json({ success: true, request: accessRequest, message: accessRequest.status === 'Accepted' ? 'Both students consented. Private booking details are now available to this requester.' : 'Access request declined' })
})

export const getTripPrivateDetails = asyncHandler(async (req, res) => {
  const trip = await TravelPost.findOne({ _id: req.params.id, status: 'Approved' })
  if (!trip) throw new ApiError(404, 'Approved trip not found')
  const isOwner = String(trip.authorId) === String(req.user._id)
  const hasConsent = isOwner || await TripAccessRequest.exists({
    tripId: trip._id, ownerId: trip.authorId, requesterId: req.user._id,
    requesterConsent: true, ownerConsent: true, status: 'Accepted'
  })
  if (!hasConsent) throw new ApiError(403, 'Private booking details require consent from both students')
  res.json({ success: true, booking: trip.booking, seatDetails: trip.seatDetails, contactPreference: trip.contactPreference })
})
