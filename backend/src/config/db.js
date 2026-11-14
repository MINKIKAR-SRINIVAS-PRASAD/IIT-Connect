
import mongoose from 'mongoose'
import { env } from './env.js'

export async function connectDB() {
  mongoose.set('strictQuery', true)

  if (!env.MONGO_URI) {
    throw new Error('MONGO_URI is missing. Check backend/.env')
  }

  await mongoose.connect(env.MONGO_URI)

  console.log('✅ MongoDB connected')
}
