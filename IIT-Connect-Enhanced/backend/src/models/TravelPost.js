import mongoose from 'mongoose'

const travelPostSchema = new mongoose.Schema({
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true }, branch: { type: String, required: true }, batch: { type: String, required: true }, iit: { type: String, required: true, index: true },
  destination: { type: String, required: true, maxlength: 120 }, location: { type: String, required: true, maxlength: 120 },
  category: { type: String, enum: ['Trekking','Weekend Trips','Pilgrimage','Adventure','Sightseeing'], required: true },
  description: { type: String, required: true, maxlength: 1000 }, budget: { type: String, default: '', maxlength: 40 }, members: { type: Number, min: 1, max: 50, default: 1 },
  travelMode: { type: String, enum: ['Train','Flight','Bus','Trip'], default: 'Trip' },
  travelDate: { type: Date, default: null, index: true }, from: { type: String, required: true }, to: { type: String, required: true }, notes: { type: String, default: '' },
  booking: {
    trainName: String, trainNumber: String, pnr: String, bookingStatus: String, coach: String, seat: String, berthType: String,
    boardingStation: String, arrivalStation: String, operator: String, serviceNumber: String, busType: String, ticketReference: String,
    seatNumber: String, boardingPoint: String, dropPoint: String, airline: String, flightNumber: String, airlinePnr: String,
    bookingReference: String, flightSeat: String, departureAirport: String, arrivalAirport: String,
    departureDate: String, departureTime: String, arrivalDate: String, arrivalTime: String
  },
  seatDetails: { type: String, default: '' }, contactPreference: { type: String, enum: ['Email','Phone','WhatsApp'], default: 'Email' },
  status: { type: String, enum: ['Pending','Approved','Rejected','Deleted'], default: 'Pending', index: true },
  rejectionReason: { type: String, default: '' }, deletedAt: { type: Date, default: null }, deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
}, { timestamps: true })

export default mongoose.model('TravelPost', travelPostSchema)
