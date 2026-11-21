import {Router} from 'express'
import {requireAuth} from '../middleware/auth.middleware.js'
import {requireProfileComplete} from '../middleware/profileCompletion.middleware.js'
import {createTransportBooking,listMyTransportBookings,deleteTransportBooking} from '../controllers/transportBooking.controller.js'
const router=Router()
router.use(requireAuth,requireProfileComplete)
router.get('/',listMyTransportBookings)
router.post('/',createTransportBooking)
router.delete('/:id',deleteTransportBooking)
export default router
