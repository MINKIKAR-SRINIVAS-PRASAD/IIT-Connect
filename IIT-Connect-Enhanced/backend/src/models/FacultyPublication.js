import mongoose from 'mongoose'

const facultyPublicationSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  institute: { type: String, required: true, trim: true },
  department: { type: String, required: true, trim: true },
  title: { type: String, required: true, trim: true, maxlength: 240 },
  abstract: { type: String, required: true, trim: true, maxlength: 12000 },
  publicationType: { type: String, enum: ['journal', 'conference', 'book', 'patent', 'preprint', 'other'], default: 'journal' },
  authors: [{ type: String, trim: true }],
  venue: { type: String, trim: true, default: '' },
  publicationDate: { type: Date, default: null },
  doiOrUrl: { type: String, trim: true, default: '' },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true })

facultyPublicationSchema.index({ institute: 1, createdAt: -1 })
export default mongoose.model('FacultyPublication', facultyPublicationSchema)
