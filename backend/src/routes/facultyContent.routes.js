import { Router } from 'express'
import { requireAuth, requireFaculty } from '../middleware/auth.middleware.js'
import { upload } from '../middleware/upload.middleware.js'
import { listFacultyContent, createFacultyContent, deleteFacultyContent } from '../controllers/facultyContent.controller.js'

const router = Router()
router.use(requireAuth, requireFaculty)
router.get('/', listFacultyContent)
router.post('/', upload.single('media'), createFacultyContent)
router.delete('/:id', deleteFacultyContent)
export default router
