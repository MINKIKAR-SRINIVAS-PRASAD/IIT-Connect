import { Router } from 'express'
import { requireAuth } from '../middleware/auth.middleware.js'
import { listMyBookings, createBooking, deleteMyBooking } from '../controllers/transportBooking.controller.js'

const router = Router()
router.use(requireAuth)
router.get('/', listMyBookings)
router.post('/', createBooking)
router.delete('/:bookingId', deleteMyBooking)
export default router
