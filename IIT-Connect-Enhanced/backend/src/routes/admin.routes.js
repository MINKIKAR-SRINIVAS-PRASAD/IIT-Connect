import { Router } from 'express'
import { pendingFacultyRequests, reviewFacultyRequest } from '../controllers/facultyAdmin.controller.js'
import { requireAuth } from '../middleware/auth.middleware.js'
import { requireRole } from '../middleware/roles.middleware.js'
import { deletionNotifications, markDeletionNotificationRead, approveEvent, approveGallery, approvePlacement, approveTravel, approveStudy, approveCampusNews, approveFacultyContent, listUsers, logs, pendingApprovals, setBan, stats } from '../controllers/admin.controller.js'

const router = Router()

router.use(requireAuth, requireRole('admin'))

router.get('/stats', stats)
router.get('/users', listUsers)
router.get('/faculty-requests', pendingFacultyRequests)
router.put('/faculty-requests/:userId', reviewFacultyRequest)
router.put('/users/:userId/ban', setBan)

router.get('/approvals/pending', pendingApprovals)
router.put('/approvals/gallery/:id', approveGallery)
router.put('/approvals/placements/:id', approvePlacement)
router.put('/approvals/events/:id', approveEvent)
router.put('/approvals/travel/:id', approveTravel)
router.put('/approvals/study/:id', approveStudy)
router.put('/approvals/news/:id', approveCampusNews)
router.put('/approvals/faculty/:kind/:id', approveFacultyContent)

router.get('/notifications/deletions', deletionNotifications)
router.put('/notifications/deletions/:id/read', markDeletionNotificationRead)

router.get('/logs', logs)

export default router
