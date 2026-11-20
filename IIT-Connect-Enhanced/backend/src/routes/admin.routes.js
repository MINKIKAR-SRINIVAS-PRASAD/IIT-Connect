import { Router } from 'express'
import { requireAuth } from '../middleware/auth.middleware.js'
import { requireRole } from '../middleware/roles.middleware.js'
import { deletionNotifications, markDeletionNotificationRead, approveEvent, approveGallery, approvePlacement, approveTravel, approveStudy, listUsers, logs, pendingApprovals, setBan, stats } from '../controllers/admin.controller.js'

const router = Router()

router.use(requireAuth, requireRole('admin'))

router.get('/stats', stats)
router.get('/users', listUsers)
router.put('/users/:userId/ban', setBan)

router.get('/approvals/pending', pendingApprovals)
router.put('/approvals/gallery/:id', approveGallery)
router.put('/approvals/placements/:id', approvePlacement)
router.put('/approvals/events/:id', approveEvent)
router.put('/approvals/travel/:id', approveTravel)
router.put('/approvals/study/:id', approveStudy)

router.get('/notifications/deletions', deletionNotifications)
router.put('/notifications/deletions/:id/read', markDeletionNotificationRead)

router.get('/logs', logs)

export default router
