import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/apiError.js'
import TravelPost from '../models/TravelPost.js'
import { createContentDeletionNotification } from '../utils/contentDeletion.js'

const clean = (v,n=160) => String(v ?? '').trim().slice(0,n)
const categories = ['Trekking','Weekend Trips','Pilgrimage','Adventure','Sightseeing']
const requiredFields = {
  Train: ['trainName','trainNumber','pnr','bookingStatus','coach','seat','berthType','boardingStation','arrivalStation','departureDate','departureTime','arrivalDate','arrivalTime'],
  Bus: ['operator','serviceNumber','busType','ticketReference','seatNumber','boardingPoint','dropPoint','departureDate','departureTime','arrivalDate','arrivalTime'],
  Flight: ['airline','flightNumber','airlinePnr','bookingReference','flightSeat','departureAirport','arrivalAirport','departureDate','departureTime','arrivalDate','arrivalTime']
}

export const createTravelPost = asyncHandler(async (req,res) => {
  const profile = req.user.profile || {}
  const iit=clean(profile.iit,100), name=clean(profile.name,100), branch=clean(profile.branch,100), batch=clean(profile.batch,20)
  if(!iit||!name||!branch||!batch) throw new ApiError(400,'Complete your student profile before posting')
  const destination=clean(req.body.destination,120), location=clean(req.body.location,120), category=req.body.category
  const description=clean(req.body.description,1000), budget=clean(req.body.budget,40), members=Number(req.body.members)
  const travelMode=req.body.travelMode
  const dateValue=req.body.date||req.body.travelDate
  const travelDate=dateValue?new Date(dateValue):null
  if(!destination||!location||!description||!budget) throw new ApiError(400,'Complete all trip overview fields')
  if(!categories.includes(category)) throw new ApiError(400,'Choose a valid trip category')
  if(!Number.isInteger(members)||members<1||members>50) throw new ApiError(400,'Maximum members must be between 1 and 50')
  if(!travelDate||Number.isNaN(travelDate.getTime())) throw new ApiError(400,'A valid trip date is required')
  if(!['Train','Bus','Flight'].includes(travelMode)) throw new ApiError(400,'Choose Train, Bus or Flight')
  const booking=req.body.booking||{}
  const missing=requiredFields[travelMode].filter(key=>!clean(booking[key],160))
  if(missing.length) throw new ApiError(400,'Complete all required '+travelMode+' booking fields: '+missing.join(', '))
  const safeBooking={}
  for(const key of Object.keys(booking)) safeBooking[key]=clean(booking[key],160)
  const post=await TravelPost.create({
    authorId:req.user._id,name,branch,batch,iit,destination,location,category,description,budget,members,
    travelMode,travelDate,from:location,to:destination,notes:description,booking:safeBooking,status:'Pending'
  })
  res.status(201).json({success:true,post,message:'Trip submitted for admin approval'})
})

export const listApprovedTravel = asyncHandler(async (req,res) => {
  // Never return booking references, PNRs, seat/coach identifiers or other private booking fields here.
  const posts=await TravelPost.find({status:'Approved'}).select('-booking -seatDetails -contactPreference -rejectionReason')
    .sort({travelDate:1,createdAt:-1}).limit(100)
    .populate('authorId','profile.name profile.iit profile.branch profile.batch profile.photoUrl')
  res.json({success:true,posts})
})

export const deleteMyTravelPost = asyncHandler(async (req,res) => {
  const post=await TravelPost.findOne({_id:req.params.id,authorId:req.user._id,status:{$ne:'Deleted'}})
  if(!post) throw new ApiError(404,'Trip not found or you do not own it')
  await createContentDeletionNotification({userId:req.user._id,post,contentType:'Trip',contentTitle:`${post.destination} · ${post.location}`})
  post.status='Deleted'; post.deletedAt=new Date(); post.deletedBy=req.user._id; await post.save()
  res.json({success:true,message:'Trip deleted for everyone'})
})

export const listMyTravel = asyncHandler(async (req,res) => {
  const posts=await TravelPost.find({authorId:req.user._id,status:{$ne:'Deleted'}}).sort({createdAt:-1}).limit(60)
  res.json({success:true,posts})
})
