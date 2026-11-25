import { createDefaultAdmin } from "./seed/createadmin.js"
import { seedDemoAccounts } from "./seed/seedDemoAccounts.js"
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import morgan from 'morgan'
import http from 'http'

import { assertEnv, env } from './config/env.js'
import { connectDB } from './config/db.js'
import { initSocket } from './socket/index.js'

import authRoutes from './routes/auth.routes.js'
import profileRoutes from './routes/profile.routes.js'
import chatRoutes from './routes/chat.routes.js'
import galleryRoutes from './routes/gallery.routes.js'
import placementRoutes from './routes/placement.routes.js'
import eventRoutes from './routes/event.routes.js'
import travelRoutes from './routes/travel.routes.js'
import communityTripRoutes from './routes/communityTrip.routes.js'
import transportBookingRoutes from './routes/transportBooking.routes.js'
import studyRoutes from './routes/study.routes.js'
import commentRoutes from './routes/comment.routes.js'
import likeRoutes from './routes/like.routes.js'
import adminRoutes from './routes/admin.routes.js'
import healthRoutes from './routes/health.routes.js'
import newsRoutes from './routes/news.routes.js'
import communityPostRoutes from './routes/communityPost.routes.js'
import aiRoutes from './routes/ai.routes.js'

import { errorHandler, notFound } from './middleware/error.middleware.js'

async function bootstrap() {
  assertEnv()
  await connectDB()
  await createDefaultAdmin(env)
  await seedDemoAccounts(env)
  const app = express()
  app.use(helmet())
  app.use(morgan('dev'))

  app.use(
    cors({
      origin: env.CLIENT_ORIGIN,
      credentials: true
    })
  )

  app.use(express.json({ limit: '1mb' }))
  app.use(express.urlencoded({ extended: true }))
  app.use(cookieParser())

  app.get('/', (req, res) => {
    res.json({ ok: true, name: 'IIT Connect API' })
  })

  app.use('/api/health', healthRoutes)
  app.use('/api/news', newsRoutes)
  app.use('/api/posts', communityPostRoutes)
  app.use('/api/ai', aiRoutes)
  app.use('/api/auth', authRoutes)
  app.use('/api/profile', profileRoutes)
  app.use('/api/chat', chatRoutes)
  app.use('/api/gallery', galleryRoutes)
  app.use('/api/placements', placementRoutes)
  app.use('/api/events', eventRoutes)
  app.use('/api/travel', travelRoutes)
  app.use('/api/trips', communityTripRoutes)
  app.use('/api/transport-bookings', transportBookingRoutes)
  app.use('/api/study', studyRoutes)
  app.use('/api/comments', commentRoutes)
  app.use('/api/likes', likeRoutes)
  app.use('/api/admin', adminRoutes)

  app.use(notFound)
  app.use(errorHandler)

  const server = http.createServer(app)
  initSocket(server, env.CLIENT_ORIGIN)

  server.listen(env.PORT, () => {
    console.log(`🚀 Backend running on http://localhost:${env.PORT}`)
  })
}

bootstrap().catch((e) => {
  console.error(e)
  process.exit(1)
})
