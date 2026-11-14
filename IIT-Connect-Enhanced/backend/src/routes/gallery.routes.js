import { Router } from 'express'
import { requireAuth } from '../middleware/auth.middleware.js'
import { upload } from '../middleware/upload.middleware.js'
import { validateImageUpload } from '../middleware/imageUpload.middleware.js'
import { createGalleryPost, listApprovedGallery, listMyGallery } from '../controllers/gallery.controller.js'

const router = Router()

router.get('/', listApprovedGallery)
router.get('/mine', requireAuth, listMyGallery)
router.post('/', requireAuth, upload.single('image'), validateImageUpload, createGalleryPost)

export default router
