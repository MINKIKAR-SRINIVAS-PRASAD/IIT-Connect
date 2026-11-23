import { Router } from 'express'
import { requireAuth, requireFaculty } from '../middleware/auth.middleware.js'
import { listPosts, createPost, listSectionPosts, createSectionPost, listMessages, sendMessage, facultyDirectory } from '../controllers/faculty.controller.js'

const router = Router()
router.use(requireAuth, requireFaculty)

// Keep fixed routes before /:section so "posts", "community", and "directory"
// are not accidentally captured as section names.
router.get('/posts', listPosts)
router.post('/posts', createPost)
router.get('/community', listMessages)
router.post('/community', sendMessage)
router.get('/directory', facultyDirectory)

router.get('/:section', listSectionPosts)
router.post('/:section', createSectionPost)

export default router
