import mongoose from 'mongoose'
const facultyMessageSchema = new mongoose.Schema({
  facultyId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true },
  text: { type: String, required: true, trim: true, maxlength: 2000 },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true })
export default mongoose.model('FacultyMessage', facultyMessageSchema)
