import { Router } from 'express'
import { requireAuth, requireFaculty } from '../middleware/auth.middleware.js'
import { listPosts, createPost, listMessages, sendMessage, facultyDirectory } from '../controllers/faculty.controller.js'
const router = Router()
router.use(requireAuth, requireFaculty)
router.get('/posts', listPosts)
router.post('/posts', createPost)
router.get('/community', listMessages)
router.post('/community', sendMessage)
router.get('/directory', facultyDirectory)
export default router
