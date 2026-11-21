import { Router } from 'express'
import { body, param } from 'express-validator'
import FacultyPublication from '../models/FacultyPublication.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/apiError.js'
import { validate } from '../middleware/validate.middleware.js'
import { requireAuth } from '../middleware/auth.middleware.js'
import { requireFaculty } from '../middleware/faculty.middleware.js'

const router = Router()
router.use(requireAuth, requireFaculty)

router.get('/publications', asyncHandler(async (req, res) => {
  const publications = await FacultyPublication.find({}).populate('author', 'facultyProfile email').sort({ createdAt: -1 }).limit(100)
  res.json({ success: true, publications })
}))

router.post('/publications',
  body('title').isString().trim().isLength({ min: 3, max: 240 }),
  body('abstract').isString().trim().isLength({ min: 20, max: 12000 }),
  body('institute').isString().trim().notEmpty(),
  body('department').isString().trim().notEmpty(),
  body('publicationType').optional().isIn(['journal','conference','book','patent','preprint','other']),
  body('authors').optional().isArray({ max: 100 }),
  body('venue').optional().isString().trim().isLength({ max: 300 }),
  body('doiOrUrl').optional().isString().trim().isLength({ max: 2000 }),
  validate,
  asyncHandler(async (req, res) => {
    const publication = await FacultyPublication.create({
      author: req.user._id,
      institute: req.body.institute,
      department: req.body.department,
      title: req.body.title,
      abstract: req.body.abstract,
      publicationType: req.body.publicationType || 'journal',
      authors: req.body.authors || [],
      venue: req.body.venue || '',
      publicationDate: req.body.publicationDate || null,
      doiOrUrl: req.body.doiOrUrl || ''
    })
    res.status(201).json({ success: true, publication })
  })
)

router.delete('/publications/:id', param('id').isMongoId(), validate, asyncHandler(async (req, res) => {
  const publication = await FacultyPublication.findById(req.params.id)
  if (!publication) throw new ApiError(404, 'Publication not found')
  if (!publication.author.equals(req.user._id)) throw new ApiError(403, 'You can only remove your own publication')
  await publication.deleteOne()
  res.json({ success: true })
}))

export default router
