import mongoose from 'mongoose'
import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/apiError.js'
import CommunityTrip from '../models/CommunityTrip.js'
import TripJoinRequest from '../models/TripJoinRequest.js'

const populateTrip = { path: 'authorId', select: 'email profile' }

export const listCommunityTrips = asyncHandler(async (req, res) => {
  const trips = await CommunityTrip.find({ status: 'Published', approvalStatus: 'Approved', travelDate: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) } })
    .sort({ travelDate: 1, createdAt: -1 }).populate(populateTrip)
  res.json({ success: true, trips })
})

export const listMyCommunityTrips = asyncHandler(async (req, res) => {
  const trips = await CommunityTrip.find({ authorId: req.user._id }).sort({ createdAt: -1 }).populate(populateTrip)
  res.json({ success: true, trips })
})

export const createCommunityTrip = asyncHandler(async (req, res) => {
  const { destination, location, category, date, budget, maxMembers, description } = req.body
  const required = [destination, location, category, date, budget, maxMembers, description]
  if (required.some(value => value === undefined || value === null || String(value).trim() === '')) {
    throw new ApiError(400, 'Complete every trip field')
  }
  if (!['Trekking', 'Weekend Trips', 'Pilgrimage', 'Adventure', 'Sightseeing'].includes(category)) throw new ApiError(400, 'Invalid trip category')
  const travelDate = new Date(date)
  if (Number.isNaN(travelDate.getTime()) || travelDate < new Date(new Date().setHours(0, 0, 0, 0))) throw new ApiError(400, 'Trip date must be today or in the future')
  const amount = Number(budget), capacity = Number(maxMembers)
  if (!Number.isFinite(amount) || amount <= 0) throw new ApiError(400, 'Budget must be greater than zero')
  if (!Number.isInteger(capacity) || capacity < 2 || capacity > 50) throw new ApiError(400, 'Maximum members must be between 2 and 50')
  const trip = await CommunityTrip.create({
    authorId: req.user._id, destination: String(destination).trim(), location: String(location).trim(),
    approvalStatus: 'Pending',
    category, travelDate, budget: amount, maxMembers: capacity, currentMembers: 1,
    memberIds: [req.user._id], description: String(description).trim()
  })
  await trip.populate(populateTrip)
  res.status(201).json({ success: true, trip, message: 'Trip submitted for admin approval' })
})

export const requestToJoinTrip = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.tripId)) throw new ApiError(400, 'Invalid trip id')
  const trip = await CommunityTrip.findOne({ _id: req.params.tripId, status: 'Published' })
  if (!trip) throw new ApiError(404, 'Trip not found or cancelled')
  if (String(trip.authorId) === String(req.user._id)) throw new ApiError(400, 'You are the trip organiser')
  if (trip.memberIds.some(id => String(id) === String(req.user._id))) throw new ApiError(409, 'You are already a member')
  if (trip.currentMembers >= trip.maxMembers) throw new ApiError(409, 'This trip is full')
  let request = await TripJoinRequest.findOne({ tripId: trip._id, requesterId: req.user._id })
  if (request?.status === 'Pending') throw new ApiError(409, 'Your join request is already pending')
  if (request?.status === 'Accepted') throw new ApiError(409, 'You have already joined this trip')
  if (request) { request.status = 'Pending'; await request.save() }
  else request = await TripJoinRequest.create({ tripId: trip._id, requesterId: req.user._id })
  res.status(201).json({ success: true, request })
})

export const listIncomingTripRequests = asyncHandler(async (req, res) => {
  const ownTrips = await CommunityTrip.find({ authorId: req.user._id }).select('_id')
  const requests = await TripJoinRequest.find({ tripId: { $in: ownTrips.map(t => t._id) }, status: 'Pending' })
    .sort({ createdAt: -1 }).populate('requesterId', 'email profile').populate('tripId', 'destination travelDate currentMembers maxMembers')
  res.json({ success: true, requests })
})

export const listMyTripRequests = asyncHandler(async (req, res) => {
  const requests = await TripJoinRequest.find({ requesterId: req.user._id }).sort({ createdAt: -1 }).populate('tripId', 'destination travelDate status currentMembers maxMembers')
  res.json({ success: true, requests })
})

export const respondToTripRequest = asyncHandler(async (req, res) => {
  const { decision } = req.body
  if (!['accept', 'decline'].includes(decision)) throw new ApiError(400, 'Decision must be accept or decline')
  const request = await TripJoinRequest.findById(req.params.requestId)
  if (!request) throw new ApiError(404, 'Join request not found')
  const trip = await CommunityTrip.findById(request.tripId)
  if (!trip) throw new ApiError(404, 'Trip not found')
  if (String(trip.authorId) !== String(req.user._id)) throw new ApiError(403, 'Only the organiser can respond')
  if (request.status !== 'Pending') throw new ApiError(409, 'This request has already been processed')
  if (decision === 'accept') {
    if (trip.status !== 'Published') throw new ApiError(409, 'Trip is no longer active')
    if (trip.currentMembers >= trip.maxMembers) throw new ApiError(409, 'Trip is full')
    if (!trip.memberIds.some(id => String(id) === String(request.requesterId))) {
      trip.memberIds.push(request.requesterId)
      trip.currentMembers = trip.memberIds.length
      await trip.save()
    }
    request.status = 'Accepted'
  } else request.status = 'Declined'
  await request.save()
  await request.populate('requesterId', 'email profile')
  await request.populate('tripId', 'destination travelDate currentMembers maxMembers')
  res.json({ success: true, request })
})

export const cancelCommunityTrip = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.tripId)) throw new ApiError(400, 'Invalid trip id')
  const trip = await CommunityTrip.findById(req.params.tripId)
  if (!trip) throw new ApiError(404, 'Trip not found')
  if (String(trip.authorId) !== String(req.user._id)) throw new ApiError(403, 'Only the organiser can cancel this trip')
  trip.status = 'Cancelled'
  await trip.save()
  await TripJoinRequest.deleteMany({ tripId: trip._id })
  res.json({ success: true })
})
