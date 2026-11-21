import { Router } from 'express'
import { requireAuth, requireFaculty } from '../middleware/auth.middleware.js'
import { listPosts, createPost, deletePost, listMessages, sendMessage } from '../controllers/faculty.controller.js'
const router = Router()
router.use(requireAuth, requireFaculty)
router.get('/posts', listPosts)
router.post('/posts', createPost)
router.delete('/posts/:id', deletePost)
router.get('/community', listMessages)
router.post('/community', sendMessage)
export default router
