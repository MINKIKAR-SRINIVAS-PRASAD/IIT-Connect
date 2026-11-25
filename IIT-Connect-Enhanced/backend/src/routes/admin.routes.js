import { Router } from 'express'
import { requireAuth } from '../middleware/auth.middleware.js'
import { requireRole } from '../middleware/roles.middleware.js'
import { approveEvent, approveGallery, approvePlacement, approveTravel, approveStudy, approveCampusNews, approveCommunityTrip, approveTransportBooking, approveCommunityGallery, listUsers, logs, pendingApprovals, setBan, stats, listFacultyRequests, reviewFacultyRequest } from '../controllers/admin.controller.js'

const router = Router()

router.use(requireAuth, requireRole('admin'))

router.get('/stats', stats)
router.get('/users', listUsers)
router.get('/faculty-requests', listFacultyRequests)
router.put('/faculty-requests/:id', reviewFacultyRequest)
router.put('/users/:userId/ban', setBan)

router.get('/approvals/pending', pendingApprovals)
router.put('/approvals/gallery/:id', approveGallery)
router.put('/approvals/community-gallery/:id', approveCommunityGallery)
router.put('/approvals/community-trips/:id', approveCommunityTrip)
router.put('/approvals/transport-bookings/:id', approveTransportBooking)
router.put('/approvals/placements/:id', approvePlacement)
router.put('/approvals/events/:id', approveEvent)
router.put('/approvals/travel/:id', approveTravel)
router.put('/approvals/study/:id', approveStudy)
router.put('/approvals/news/:id', approveCampusNews)

router.get('/logs', logs)

export default router
