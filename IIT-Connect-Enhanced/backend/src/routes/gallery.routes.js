import { Router } from 'express'
import { requireAuth } from '../middleware/auth.middleware.js'
import { requireProfileComplete } from '../middleware/profileCompletion.middleware.js'
import { upload } from '../middleware/upload.middleware.js'
import { validateImageUpload } from '../middleware/imageUpload.middleware.js'
import { createGalleryPost, deleteMyGalleryPost, listApprovedGallery, listMyGallery } from '../controllers/gallery.controller.js'

const router = Router()

router.use(requireAuth, requireProfileComplete)

router.get('/', listApprovedGallery)
router.get('/mine', listMyGallery)
router.delete('/:id', deleteMyGalleryPost)
router.post('/', upload.single('image'), validateImageUpload, createGalleryPost)

export default router
