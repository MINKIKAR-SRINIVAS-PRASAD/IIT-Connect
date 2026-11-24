import mongoose from 'mongoose'

const messageSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true, maxlength: 12000 },
    attachments: {
      type: [{
        fileId: { type: String, required: true },
        filename: { type: String, required: true, maxlength: 255 },
        mimeType: { type: String, default: 'application/octet-stream' },
        size: { type: Number, default: 0 }
      }],
      default: []
    },
    status: { type: String, enum: ['pending', 'complete', 'failed'], default: 'complete' }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
)

const aiConversationSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, trim: true, maxlength: 120, default: 'New chat' },
    messages: { type: [messageSchema], default: [] },
    lastMessageAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
)

aiConversationSchema.index({ owner: 1, updatedAt: -1 })

export default mongoose.model('AIConversation', aiConversationSchema)
