import mongoose from 'mongoose'

const schema = new mongoose.Schema({
  facultyId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  section: { type: String, enum: ['events','gallery','study','publications','travel','placements'], required: true, index: true },
  title: { type: String, trim: true, maxlength: 200, default: '' },
  description: { type: String, maxlength: 10000, default: '' },
  category: { type: String, default: '' },
  subject: { type: String, default: '' },
  institute: { type: String, default: '' },
  department: { type: String, default: '' },
  date: { type: Date, default: null },
  venue: { type: String, default: '' },
  from: { type: String, default: '' },
  destination: { type: String, default: '' },
  url: { type: String, default: '' },
  mediaUrl: { type: String, default: '' },
  mediaPublicId: { type: String, default: '' },
  status: { type: String, enum: ['Pending','Approved','Rejected'], default: 'Pending', index: true }
}, { timestamps: true })

schema.index({ section: 1, createdAt: -1 })
export default mongoose.model('FacultyContent', schema)
