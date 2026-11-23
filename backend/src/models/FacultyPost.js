import mongoose from 'mongoose'
const facultyPostSchema = new mongoose.Schema({
  facultyId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  section: { type: String, enum: ['publications', 'placement', 'study', 'events', 'gallery', 'travel'], required: true, index: true },
  title: { type: String, required: true, trim: true, maxlength: 180 },
  description: { type: String, default: '', maxlength: 5000 },
  link: { type: String, default: '' },
  data: { type: mongoose.Schema.Types.Mixed, default: {} },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending', index: true },
  rejectionReason: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true })
export default mongoose.model('FacultyPost', facultyPostSchema)
