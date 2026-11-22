import mongoose from 'mongoose'

const facultyPostSchema = new mongoose.Schema({
  facultyId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  section: { type: String, enum: ['events', 'gallery', 'study', 'publications', 'travel', 'placement'], required: true, index: true },
  title: { type: String, required: true, trim: true, maxlength: 180 },
  description: { type: String, default: '', maxlength: 10000 },
  link: { type: String, default: '' },
  details: { type: mongoose.Schema.Types.Mixed, default: {} },
  mediaUrl: { type: String, default: '' },
  mediaPublicId: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true })

facultyPostSchema.index({ section: 1, createdAt: -1 })
export default mongoose.model('FacultyPost', facultyPostSchema)
