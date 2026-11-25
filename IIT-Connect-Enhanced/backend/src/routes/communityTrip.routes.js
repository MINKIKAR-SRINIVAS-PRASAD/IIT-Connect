import { Router } from 'express'
import { requireAuth } from '../middleware/auth.middleware.js'
import {
  listCommunityTrips, listMyCommunityTrips, createCommunityTrip, requestToJoinTrip,
  listIncomingTripRequests, listMyTripRequests, respondToTripRequest, cancelCommunityTrip
} from '../controllers/communityTrip.controller.js'

const router = Router()
router.get('/', requireAuth, listCommunityTrips)
router.get('/mine', requireAuth, listMyCommunityTrips)
router.get('/join-requests/incoming', requireAuth, listIncomingTripRequests)
router.get('/join-requests/mine', requireAuth, listMyTripRequests)
router.post('/', requireAuth, createCommunityTrip)
router.post('/:tripId/join-requests', requireAuth, requestToJoinTrip)
router.put('/join-requests/:requestId/respond', requireAuth, respondToTripRequest)
router.delete('/:tripId', requireAuth, cancelCommunityTrip)
export default router
