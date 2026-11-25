import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/apiError.js'
import CommunityPost from '../models/CommunityPost.js'
import ConnectionRequest from '../models/ConnectionRequest.js'
import { cloudinary } from '../config/cloudinary.js'

const sections=['News','Campus','Events','Community','Travel','Study','Placements','Gallery']
export const createPost=asyncHandler(async(req,res)=>{
 if(!req.file) throw new ApiError(400,'Photo is required')
 const caption=String(req.body.caption||'').trim()
 const section=String(req.body.section||'Community')
 const visibility=String(req.body.visibility||'public')
 if(!caption) throw new ApiError(400,'Caption is required')
 if(caption.length>2000) throw new ApiError(400,'Caption is too long')
 if(!sections.includes(section)) throw new ApiError(400,'Choose a valid destination section')
 if(!['public','private'].includes(visibility)) throw new ApiError(400,'Choose a valid visibility')
 const base64=`data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`
 const uploaded=await cloudinary.uploader.upload(base64,{folder:'iit-connect/community-posts',resource_type:'image'})
 // Public Gallery submissions are moderated; private posts auto-approve
 // because visibility is limited to the author and accepted connections.
 const status=visibility==='private'?'Approved':section==='Gallery'?'Pending':'Approved'
 const post=await CommunityPost.create({authorId:req.user._id,section,caption,imageUrl:uploaded.secure_url,imagePublicId:uploaded.public_id,visibility,status})
 res.status(201).json({success:true,post,message:status==='Pending'?'Gallery photo submitted for admin approval':'Post published'})
})
export const listVisiblePosts=asyncHandler(async(req,res)=>{
 const accepted=await ConnectionRequest.find({status:'accepted',$or:[{requester:req.user._id},{recipient:req.user._id}] }).select('requester recipient').lean()
 const connectedIds=accepted.map(c=>String(c.requester)===String(req.user._id)?c.recipient:c.requester)
 const posts=await CommunityPost.find({$and:[{$or:[{visibility:'public'},{visibility:'private',authorId:{$in:[req.user._id,...connectedIds]}}]},{$or:[{status:'Approved'},{authorId:req.user._id,status:'Pending'}]}]})
  .sort({createdAt:-1}).limit(100).populate('authorId','profile.name profile.iit profile.photoUrl')
 res.json({success:true,posts})
})
