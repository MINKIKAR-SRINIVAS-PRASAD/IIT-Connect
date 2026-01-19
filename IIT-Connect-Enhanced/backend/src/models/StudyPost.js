import mongoose from 'mongoose'

const studyPostSchema = new mongoose.Schema(
  {
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    tags: [{ type: String }],
    iit: { type: String, default: '' }, // optional - can be for all IITs
    links: [{ type: String }], // YouTube playlist, Google Drive, etc.
    subject: { type: String, required: true },
    semester: { type: String, default: '' },
    branch: { type: String, default: '' },
    resourceType: { type: String, enum: ['Video', 'Notes', 'Assignment', 'Book', 'Practice', 'Other'], default: 'Other' },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending', index: true },
    rejectionReason: { type: String, default: '' }
  },
  { timestamps: true }
)

studyPostSchema.index({ subject: 1, branch: 1, semester: 1 })

export default mongoose.model('StudyPost', studyPostSchema)
