
import { Router } from 'express'
import {
  requireAuth,
  requireCompletedProfile
} from '../middleware/auth.middleware.js'

import { upload } from '../middleware/upload.middleware.js'

import {
  createGalleryPost,
  listApprovedGallery,
  listMyGallery
} from '../controllers/gallery.controller.js'

const router = Router()

router.use(requireAuth, requireCompletedProfile)

router.get('/', listApprovedGallery)
router.get('/mine', listMyGallery)
router.post('/', upload.single('image'), createGalleryPost)

export default router
