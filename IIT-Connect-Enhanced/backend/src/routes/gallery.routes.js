import { Router } from 'express'
import { requireAuth } from '../middleware/auth.middleware.js'
import { requireProfileComplete } from '../middleware/profileCompletion.middleware.js'
import { upload } from '../middleware/upload.middleware.js'
import { validateImageUpload } from '../middleware/imageUpload.middleware.js'
import { createGalleryPost, deleteMyGalleryPost, listApprovedGallery, listMyGallery } from '../controllers/gallery.controller.js'

const router = Router()

// Approved campus gallery is shared and readable by both portals.
router.get('/', requireAuth, listApprovedGallery)
router.get('/mine', requireAuth, listMyGallery)
router.delete('/:id', requireAuth, deleteMyGalleryPost)
router.post('/', requireAuth, requireProfileComplete, upload.single('image'), validateImageUpload, createGalleryPost)

export default router
