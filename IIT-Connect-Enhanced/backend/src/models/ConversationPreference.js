import mongoose from 'mongoose'

const conversationPreferenceSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true, index: true },
    pinned: { type: Boolean, default: false },
    muted: { type: Boolean, default: false },
    archived: { type: Boolean, default: false }
  },
  { timestamps: true }
)

conversationPreferenceSchema.index({ userId: 1, conversationId: 1 }, { unique: true })

export default mongoose.model('ConversationPreference', conversationPreferenceSchema)
