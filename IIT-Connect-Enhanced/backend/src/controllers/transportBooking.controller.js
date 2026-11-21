import {asyncHandler} from '../utils/asyncHandler.js'
import {ApiError} from '../utils/apiError.js'
import TransportBooking from '../models/TransportBooking.js'
const fields={
 Train:['trainName','trainNumber','pnr','bookingStatus','coach','seat','berthType','boardingStation','arrivalStation','departureDate','departureTime','arrivalDate','arrivalTime'],
 Bus:['operator','serviceNumber','busType','ticketReference','seatNumber','boardingPoint','dropPoint','departureDate','departureTime','arrivalDate','arrivalTime'],
 Flight:['airline','flightNumber','airlinePnr','bookingReference','flightSeat','departureAirport','arrivalAirport','departureDate','departureTime','arrivalDate','arrivalTime']
}
const clean=v=>String(v??'').trim()
export const createTransportBooking=asyncHandler(async(req,res)=>{
 const {transportType,booking={}}=req.body
 if(!fields[transportType]) throw new ApiError(400,'Choose Train, Bus or Flight')
 const missing=fields[transportType].filter(k=>!clean(booking[k]))
 if(missing.length) throw new ApiError(400,'Complete all required fields: '+missing.join(', '))
 const dep=new Date(booking.departureDate+'T00:00:00'),arr=new Date(booking.arrivalDate+'T00:00:00')
 if(Number.isNaN(dep.getTime())||Number.isNaN(arr.getTime())||arr<dep) throw new ApiError(400,'Enter valid departure and arrival dates')
 if(arr.getTime()===dep.getTime()&&booking.arrivalTime<=booking.departureTime) throw new ApiError(400,'Arrival time must be later than departure time')
 const safe={}
 for(const key of fields[transportType]) safe[key]=clean(booking[key]).slice(0,160)
 const item=await TransportBooking.create({ownerId:req.user._id,transportType,booking:safe})
 res.status(201).json({success:true,booking:item,message:'Travel booking saved privately'})
})
export const listMyTransportBookings=asyncHandler(async(req,res)=>{
 const bookings=await TransportBooking.find({ownerId:req.user._id,status:'Saved'}).sort({createdAt:-1}).limit(100)
 res.json({success:true,bookings})
})
export const deleteTransportBooking=asyncHandler(async(req,res)=>{
 const item=await TransportBooking.findOneAndUpdate({_id:req.params.id,ownerId:req.user._id,status:'Saved'},{$set:{status:'Cancelled'}},{new:true})
 if(!item) throw new ApiError(404,'Booking not found')
 res.json({success:true,message:'Booking removed'})
})
