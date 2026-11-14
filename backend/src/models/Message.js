import mongoose from 'mongoose'

const messageSchema = new mongoose.Schema(
  {
    conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true, index: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, default: '' },
    attachments: [
      {
        url: String,
        publicId: String,
        type: { type: String, enum: ['image', 'file'], default: 'image' }
      }
    ],
    seenBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  },
  { timestamps: true }
)

export default mongoose.model('Message', messageSchema)
