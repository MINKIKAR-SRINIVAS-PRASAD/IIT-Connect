import { Router } from 'express'
import { body, param } from 'express-validator'
import { requireAuth } from '../middleware/auth.middleware.js'
import { requireFaculty } from '../middleware/faculty.middleware.js'
import { validate } from '../middleware/validate.middleware.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/apiError.js'
import FacultyEvent from '../models/FacultyEvent.js'
import FacultyGallery from '../models/FacultyGallery.js'
import FacultyStudy from '../models/FacultyStudy.js'
import FacultyTravel from '../models/FacultyTravel.js'
import FacultyChannel from '../models/FacultyChannel.js'
import FacultyMessage from '../models/FacultyMessage.js'

const router=Router()
router.use(requireAuth,requireFaculty)
const institute=req=>String(req.user.facultyProfile?.institute||'').trim()
const department=req=>String(req.user.facultyProfile?.department||'').trim()
const safeUrl=value=>!value||/^https:\/\//i.test(value)

router.get('/events',asyncHandler(async(req,res)=>{const events=await FacultyEvent.find({$or:[{status:'Approved'},{author:req.user._id}]}).populate('author','facultyProfile').sort({startAt:1}).limit(100);res.json({success:true,events})}))
router.post('/events',body('title').isString().trim().isLength({min:3,max:200}),body('startAt').isISO8601(),body('description').optional().isString().isLength({max:8000}),body('venue').optional().isString().isLength({max:300}),body('registrationUrl').optional().custom(safeUrl),validate,asyncHandler(async(req,res)=>{if(!institute(req))throw new ApiError(400,'Complete your faculty institute profile first');const event=await FacultyEvent.create({author:req.user._id,title:req.body.title,description:req.body.description||'',startAt:new Date(req.body.startAt),venue:req.body.venue||'',institute:institute(req),registrationUrl:req.body.registrationUrl||'',status:'Pending'});res.status(201).json({success:true,event,message:'Event submitted for admin approval'})}))

router.get('/gallery',asyncHandler(async(req,res)=>{const posts=await FacultyGallery.find({$or:[{status:'Approved'},{author:req.user._id}]}).populate('author','facultyProfile').sort({createdAt:-1}).limit(100);res.json({success:true,posts})}))
router.post('/gallery',body('imageUrl').isURL({protocols:['https'],require_protocol:true}),body('caption').optional().isString().isLength({max:1000}),validate,asyncHandler(async(req,res)=>{if(!institute(req))throw new ApiError(400,'Complete your faculty institute profile first');const post=await FacultyGallery.create({author:req.user._id,imageUrl:req.body.imageUrl,caption:req.body.caption||'',institute:institute(req),status:'Pending'});res.status(201).json({success:true,post,message:'Gallery post submitted for admin approval'})}))

router.get('/study',asyncHandler(async(req,res)=>{const resources=await FacultyStudy.find({$or:[{status:'Approved'},{author:req.user._id}]}).populate('author','facultyProfile').sort({createdAt:-1}).limit(100);res.json({success:true,resources})}))
router.post('/study',body('title').isString().trim().isLength({min:3,max:200}),body('subject').isString().trim().notEmpty(),body('resourceUrl').optional().custom(safeUrl),body('description').optional().isString().isLength({max:8000}),validate,asyncHandler(async(req,res)=>{if(!institute(req))throw new ApiError(400,'Complete your faculty institute profile first');const resource=await FacultyStudy.create({author:req.user._id,title:req.body.title,subject:req.body.subject,description:req.body.description||'',resourceUrl:req.body.resourceUrl||'',institute:institute(req),tags:Array.isArray(req.body.tags)?req.body.tags.slice(0,20):[],status:'Pending'});res.status(201).json({success:true,resource,message:'Study resource submitted for admin approval'})}))

router.get('/travel',asyncHandler(async(req,res)=>{const plans=await FacultyTravel.find({$or:[{status:'Approved'},{author:req.user._id}]}).populate('author','facultyProfile').sort({travelDate:1}).limit(100);res.json({success:true,plans})}))
router.post('/travel',body('title').isString().trim().isLength({min:3,max:200}),body('from').isString().trim().notEmpty(),body('to').isString().trim().notEmpty(),body('travelDate').isISO8601(),body('details').optional().isString().isLength({max:5000}),validate,asyncHandler(async(req,res)=>{if(!institute(req))throw new ApiError(400,'Complete your faculty institute profile first');const plan=await FacultyTravel.create({author:req.user._id,title:req.body.title,details:req.body.details||'',from:req.body.from,to:req.body.to,travelDate:new Date(req.body.travelDate),institute:institute(req),contactNote:req.body.contactNote||'',status:'Pending'});res.status(201).json({success:true,plan,message:'Travel post submitted for admin approval'})}))

router.post('/community/join',asyncHandler(async(req,res)=>{let channel=await FacultyChannel.findOne({title:'Verified Faculty Community'});if(!channel)channel=await FacultyChannel.create({title:'Verified Faculty Community',participants:[req.user._id]});if(!channel.participants.some(x=>x.equals(req.user._id))){channel.participants.push(req.user._id);await channel.save()}res.json({success:true,channelId:channel._id,title:channel.title})}))
router.get('/community/messages',asyncHandler(async(req,res)=>{const channel=await FacultyChannel.findOne({title:'Verified Faculty Community',participants:req.user._id});if(!channel)throw new ApiError(403,'Join the faculty community first');const messages=await FacultyMessage.find({channel:channel._id}).populate('sender','facultyProfile').sort({createdAt:1}).limit(150);res.json({success:true,messages})}))
router.post('/community/messages',body('text').isString().trim().isLength({min:1,max:3000}),validate,asyncHandler(async(req,res)=>{const channel=await FacultyChannel.findOne({title:'Verified Faculty Community',participants:req.user._id});if(!channel)throw new ApiError(403,'Join the faculty community first');const message=await FacultyMessage.create({channel:channel._id,sender:req.user._id,text:req.body.text.trim()});await FacultyChannel.updateOne({_id:channel._id},{$set:{lastMessageAt:new Date()}});const populated=await message.populate('sender','facultyProfile');res.status(201).json({success:true,message:populated})}))
export default router
