import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/apiError.js'
import CampusNews from '../models/CampusNews.js'
import ConnectionRequest from '../models/ConnectionRequest.js'
const categories=['Announcement','Achievement','Research','Campus life','Other']
export const createCampusNews=asyncHandler(async(req,res)=>{
 const title=String(req.body.title||'').trim(),body=String(req.body.body||'').trim(),category=categories.includes(req.body.category)?req.body.category:'Other',sourceUrl=String(req.body.sourceUrl||'').trim()
 if(title.length<5||title.length>160)throw new ApiError(400,'Title must be between 5 and 160 characters')
 if(body.length<20||body.length>6000)throw new ApiError(400,'Story must be between 20 and 6000 characters')
 if(sourceUrl){try{const u=new URL(sourceUrl);if(!['http:','https:'].includes(u.protocol))throw Error()}catch{throw new ApiError(400,'Source link must be a valid http or https URL')}}
 const institute=req.user.profile?.iit||req.user.profile?.institute||'IIT Community'
 const visibility=req.body.visibility==='connections'?'connections':'public'
 const post=await CampusNews.create({authorId:req.user._id,institute,title,body,category,sourceUrl,visibility,status:'Pending'})
 res.status(201).json({success:true,post,message:'Campus news submitted for review'})
})
export const listApprovedCampusNews=asyncHandler(async(req,res)=>{
 const viewerId=req.user?._id
 const accepted=viewerId?await ConnectionRequest.find({status:'accepted',$or:[{requester:viewerId},{recipient:viewerId}]}).select('requester recipient').lean():[]
 const connectedIds=accepted.map(row=>String(row.requester)===String(viewerId)?row.recipient:row.requester)
 const visibilityFilter=viewerId?{$or:[{visibility:{$ne:'connections'}},{authorId:viewerId},{authorId:{$in:connectedIds}}]}:{visibility:{$ne:'connections'}}
 const posts=await CampusNews.find({status:'Approved',...visibilityFilter}).sort({createdAt:-1}).limit(100).populate('authorId','profile.name profile.iit profile.institute role')
 res.json({success:true,posts})
})
export const listMyCampusNews=asyncHandler(async(req,res)=>{
 const posts=await CampusNews.find({authorId:req.user._id}).sort({createdAt:-1}).limit(50)
 res.json({success:true,posts})
})
