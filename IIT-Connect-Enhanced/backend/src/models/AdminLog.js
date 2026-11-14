import mongoose from 'mongoose'

const adminLogSchema = new mongoose.Schema(
  {
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true },
    targetType: { type: String, required: true },
    targetId: { type: mongoose.Schema.Types.ObjectId, required: false },
    metadata: { type: Object, default: {} }
  },
  { timestamps: true }
)

export default mongoose.model('AdminLog', adminLogSchema)
