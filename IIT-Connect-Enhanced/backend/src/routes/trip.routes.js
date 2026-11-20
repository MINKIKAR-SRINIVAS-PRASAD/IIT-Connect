import {Router} from 'express'
import {requireAuth} from '../middleware/auth.middleware.js'
import {requireProfileComplete} from '../middleware/profileCompletion.middleware.js'
import {createTripPlan,deleteTripPlan,listTripPlans,listMyTripPlans,requestTripJoin,listIncomingJoinRequests,listMyJoinRequests,respondToJoinRequest} from '../controllers/tripPlan.controller.js'
const router=Router()
router.use(requireAuth,requireProfileComplete)
router.get('/',listTripPlans)
router.get('/mine',listMyTripPlans)
router.get('/join-requests/incoming',listIncomingJoinRequests)
router.get('/join-requests/mine',listMyJoinRequests)
router.post('/',createTripPlan)
router.post('/:id/join-requests',requestTripJoin)
router.put('/join-requests/:requestId/respond',respondToJoinRequest)
router.delete('/:id',deleteTripPlan)
export default router
