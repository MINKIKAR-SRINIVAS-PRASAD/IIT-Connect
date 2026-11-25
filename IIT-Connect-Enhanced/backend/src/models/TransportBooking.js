import mongoose from 'mongoose'

const transportBookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  transportType: { type: String, enum: ['Train', 'Bus', 'Flight'], required: true },
  booking: { type: mongoose.Schema.Types.Mixed, required: true }
}, { timestamps: true })

export default mongoose.model('TransportBooking', transportBookingSchema)
