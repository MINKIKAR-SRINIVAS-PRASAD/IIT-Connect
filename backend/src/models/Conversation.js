import mongoose from 'mongoose'

const conversationSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['dm', 'group', 'community'], required: true },
    title: { type: String, default: '' },
    iit: { type: String, default: '' },

    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

    lastMessageAt: { type: Date, default: null },
    lastMessageText: { type: String, default: '' }
  },
  { timestamps: true }
)

conversationSchema.index({ type: 1, participants: 1 })

export default mongoose.model('Conversation', conversationSchema)
