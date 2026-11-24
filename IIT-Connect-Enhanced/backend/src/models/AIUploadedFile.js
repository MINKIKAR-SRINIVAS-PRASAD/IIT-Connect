import mongoose from 'mongoose'

const aiUploadedFileSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  fileId: { type: String, required: true, unique: true },
  filename: { type: String, required: true, maxlength: 255 },
  mimeType: { type: String, default: 'application/octet-stream' },
  size: { type: Number, default: 0 }
}, { timestamps: true })

export default mongoose.model('AIUploadedFile', aiUploadedFileSchema)
