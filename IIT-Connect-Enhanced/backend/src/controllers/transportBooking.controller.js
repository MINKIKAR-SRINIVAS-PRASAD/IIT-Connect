import mongoose from 'mongoose'
import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/apiError.js'
import TransportBooking from '../models/TransportBooking.js'

const requiredFields = {
  Train: ['trainName','trainNumber','pnr','bookingStatus','coach','seat','berthType','boardingStation','arrivalStation','departureDate','departureTime','arrivalDate','arrivalTime'],
  Bus: ['operator','serviceNumber','busType','ticketReference','seatNumber','boardingPoint','dropPoint','departureDate','departureTime','arrivalDate','arrivalTime'],
  Flight: ['airline','flightNumber','airlinePnr','bookingReference','flightSeat','departureAirport','arrivalAirport','departureDate','departureTime','arrivalDate','arrivalTime']
}

export const listMyBookings = asyncHandler(async (req, res) => {
  const bookings = await TransportBooking.find({ userId: req.user._id }).sort({ createdAt: -1 })
  res.json({ success: true, bookings })
})

export const createBooking = asyncHandler(async (req, res) => {
  const { transportType, booking } = req.body
  if (!requiredFields[transportType] || !booking || typeof booking !== 'object' || Array.isArray(booking)) throw new ApiError(400, 'Invalid transport booking')
  const missing = requiredFields[transportType].filter(key => !String(booking[key] ?? '').trim())
  if (missing.length) throw new ApiError(400, 'Complete every required booking field')
  const departure = new Date(booking.departureDate + 'T' + booking.departureTime)
  const arrival = new Date(booking.arrivalDate + 'T' + booking.arrivalTime)
  if (Number.isNaN(departure.getTime()) || Number.isNaN(arrival.getTime()) || arrival <= departure) throw new ApiError(400, 'Arrival must be later than departure')
  const saved = await TransportBooking.create({ userId: req.user._id, transportType, booking })
  res.status(201).json({ success: true, booking: saved, message: 'Booking submitted for admin approval' })
})

export const deleteMyBooking = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.bookingId)) throw new ApiError(400, 'Invalid booking id')
  const deleted = await TransportBooking.findOneAndDelete({ _id: req.params.bookingId, userId: req.user._id })
  if (!deleted) throw new ApiError(404, 'Booking not found')
  res.json({ success: true })
})
