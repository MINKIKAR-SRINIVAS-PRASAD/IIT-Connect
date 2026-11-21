import { Router } from 'express'
import { requireAuth } from '../middleware/auth.middleware.js'
import { requireStudentCommunity } from '../middleware/studentCommunity.middleware.js'
import { requireProfileComplete } from '../middleware/profileCompletion.middleware.js'
import { createTravelPost, deleteMyTravelPost, listApprovedTravel, listMyTravel } from '../controllers/travel.controller.js'
import { getTripPrivateDetails, listIncomingTripRequests, listMyTripRequests, requestTripAccess, respondToTripRequest } from '../controllers/tripAccess.controller.js'

const router = Router()

router.use(requireAuth, requireStudentCommunity, requireProfileComplete)

router.get('/', listApprovedTravel)
router.get('/mine', listMyTravel)
router.get('/access-requests/incoming', listIncomingTripRequests)
router.get('/access-requests/mine', listMyTripRequests)
router.post('/:id/access-requests', requestTripAccess)
router.put('/access-requests/:requestId/respond', respondToTripRequest)
router.get('/:id/private-details', getTripPrivateDetails)
router.delete('/:id', deleteMyTravelPost)
router.post('/', createTravelPost)

export default router
