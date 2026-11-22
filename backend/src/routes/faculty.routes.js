import { Router } from 'express'
import { requireAuth, requireFaculty } from '../middleware/auth.middleware.js'
import { upload } from '../middleware/upload.middleware.js'
import { listPosts, createPost, deletePost, listMessages, sendMessage, facultyDirectory } from '../controllers/faculty.controller.js'

const router = Router()
router.use(requireAuth, requireFaculty)
router.get('/posts', listPosts)
router.post('/posts', upload.single('media'), createPost)
router.delete('/posts/:id', deletePost)
router.get('/community', listMessages)
router.post('/community', sendMessage)
router.get('/directory', facultyDirectory)
export default router
