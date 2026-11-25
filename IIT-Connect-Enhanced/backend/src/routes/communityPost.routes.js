import { Router } from 'express'
import { requireAuth } from '../middleware/auth.middleware.js'
import { upload } from '../middleware/upload.middleware.js'
import { createPost,listVisiblePosts,deleteCommunityPost } from '../controllers/communityPost.controller.js'
const router=Router()
router.get('/feed',requireAuth,listVisiblePosts)
router.post('/',requireAuth,upload.single('media'),createPost)
router.delete('/:id',requireAuth,deleteCommunityPost)
export default router
