import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/apiError.js'
import TripPlan from '../models/TripPlan.js'
import TripJoinRequest from '../models/TripJoinRequest.js'

const clean=(v,n=160)=>String(v??'').trim().slice(0,n)
const categories=['Trekking','Weekend Trips','Pilgrimage','Adventure','Sightseeing']
const populateAuthor=q=>q.populate('authorId','profile.name profile.iit profile.branch profile.batch profile.photoUrl')

export const createTripPlan=asyncHandler(async(req,res)=>{
 const p=req.user.profile||{}
 const name=clean(p.name,100),iit=clean(p.iit,100),branch=clean(p.branch,100),batch=clean(p.batch,20)
 if(!name||!iit||!branch||!batch) throw new ApiError(400,'Complete your student profile before publishing a trip')
 const {destination,location,category,description}=req.body
 const date=req.body.date?new Date(req.body.date):null
 const budget=Number(req.body.budget),maxMembers=Number(req.body.maxMembers)
 if(!clean(destination,120)||!clean(location,120)||!clean(description,1000)) throw new ApiError(400,'Complete all trip details')
 if(!categories.includes(category)) throw new ApiError(400,'Choose a valid category')
 if(!date||Number.isNaN(date.getTime())||date<new Date(new Date().toDateString())) throw new ApiError(400,'Choose a valid future trip date')
 if(!Number.isFinite(budget)||budget<=0) throw new ApiError(400,'Budget must be greater than zero')
 if(!Number.isInteger(maxMembers)||maxMembers<2||maxMembers>50) throw new ApiError(400,'Maximum members must be between 2 and 50')
 const trip=await TripPlan.create({authorId:req.user._id,name,iit,branch,batch,destination:clean(destination,120),location:clean(location,120),category,description:clean(description,1000),travelDate:date,budget,maxMembers,currentMembers:1})
 res.status(201).json({success:true,trip,message:'Trip published'})
})

export const listTripPlans=asyncHandler(async(req,res)=>{
 const trips=await populateAuthor(TripPlan.find({status:'Published',travelDate:{$gte:new Date(new Date().toDateString())}}).sort({travelDate:1}).limit(100))
 res.json({success:true,trips})
})

export const listMyTripPlans=asyncHandler(async(req,res)=>{
 const trips=await populateAuthor(TripPlan.find({authorId:req.user._id,status:{$ne:'Cancelled'}}).sort({createdAt:-1}).limit(100))
 res.json({success:true,trips})
})

export const deleteTripPlan=asyncHandler(async(req,res)=>{
 const trip=await TripPlan.findOneAndUpdate({_id:req.params.id,authorId:req.user._id,status:'Published'},{$set:{status:'Cancelled'}},{new:true})
 if(!trip) throw new ApiError(404,'Trip not found or already cancelled')
 res.json({success:true,message:'Trip cancelled'})
})

export const requestTripJoin=asyncHandler(async(req,res)=>{
 const trip=await TripPlan.findOne({_id:req.params.id,status:'Published'})
 if(!trip) throw new ApiError(404,'Trip is no longer available')
 if(String(trip.authorId)===String(req.user._id)) throw new ApiError(400,'You cannot join your own trip')
 if(trip.currentMembers>=trip.maxMembers) throw new ApiError(400,'This trip is already full')
 let request=await TripJoinRequest.findOne({tripId:trip._id,requesterId:req.user._id})
 if(request&&request.status==='Pending') return res.json({success:true,request,message:'Your request is already pending'})
 if(request&&request.status==='Accepted') return res.status(409).json({success:false,message:'You have already joined this trip'})
 if(request){request.status='Pending';await request.save()}
 else {
  try { request=await TripJoinRequest.create({tripId:trip._id,requesterId:req.user._id,ownerId:trip.authorId}) }
  catch(e){if(e.code===11000) request=await TripJoinRequest.findOne({tripId:trip._id,requesterId:req.user._id});else throw e}
 }
 res.status(201).json({success:true,request,message:'Join request sent to trip organiser'})
})

export const listIncomingJoinRequests=asyncHandler(async(req,res)=>{
 const requests=await TripJoinRequest.find({ownerId:req.user._id,status:'Pending'}).sort({createdAt:-1}).populate('tripId','destination location travelDate budget maxMembers currentMembers').populate('requesterId','email profile.name profile.iit profile.branch profile.batch profile.photoUrl')
 res.json({success:true,requests})
})

export const listMyJoinRequests=asyncHandler(async(req,res)=>{
 const requests=await TripJoinRequest.find({requesterId:req.user._id}).sort({createdAt:-1}).populate('tripId','destination location travelDate budget maxMembers currentMembers').populate('ownerId','profile.name profile.iit')
 res.json({success:true,requests})
})

export const respondToJoinRequest=asyncHandler(async(req,res)=>{
 const {decision}=req.body
 if(!['accept','decline'].includes(decision)) throw new ApiError(400,'Choose accept or decline')
 const request=await TripJoinRequest.findOne({_id:req.params.requestId,ownerId:req.user._id,status:'Pending'})
 if(!request) throw new ApiError(404,'Pending join request not found')
 if(decision==='accept'){
  const trip=await TripPlan.findOneAndUpdate({_id:request.tripId,status:'Published', $expr:{$lt:['$currentMembers','$maxMembers']}},{$inc:{currentMembers:1}},{new:true})
  if(!trip) throw new ApiError(409,'Trip is full or no longer available')
  request.status='Accepted'
 } else request.status='Declined'
 await request.save()
 res.json({success:true,request,message:decision==='accept'?'Student added to your trip':'Request declined'})
})
