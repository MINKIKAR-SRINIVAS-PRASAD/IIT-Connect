import mongoose from 'mongoose'

const studyPostSchema = new mongoose.Schema(
  {
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    tags: [{ type: String }],
    iit: { type: String, default: '' },
    links: [{ type: String }],
    subject: { type: String, required: true },
    semester: { type: String, default: '' },
    branch: { type: String, default: '' },
    resourceType: { type: String, enum: ['Video', 'Notes', 'Assignment', 'Book', 'Practice', 'Other'], default: 'Other' },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected', 'Deleted'], default: 'Pending', index: true },
    rejectionReason: { type: String, default: '' },
    deletedAt: { type: Date, default: null },
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
  },
  { timestamps: true }
)

studyPostSchema.index({ subject: 1, branch: 1, semester: 1 })

export default mongoose.model('StudyPost', studyPostSchema)
