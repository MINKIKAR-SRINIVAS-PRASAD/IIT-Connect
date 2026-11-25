import mongoose from 'mongoose'
const schema=new mongoose.Schema({
 authorId:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true,index:true},
 institute:{type:String,default:'IIT Community',trim:true,maxlength:120},
 title:{type:String,required:true,trim:true,maxlength:160},
 body:{type:String,required:true,trim:true,maxlength:6000},
 category:{type:String,enum:['Announcement','Achievement','Research','Campus life','Other'],default:'Other',index:true},
 sourceUrl:{type:String,default:'',trim:true,maxlength:1000},
 mediaUrl:{type:String,default:'',trim:true,maxlength:1000},
 mediaPublicId:{type:String,default:'',trim:true,maxlength:300},
 visibility:{type:String,enum:['public','connections'],default:'public',index:true},
 status:{type:String,enum:['Pending','Approved','Rejected'],default:'Pending',index:true},
 rejectionReason:{type:String,default:''}
},{timestamps:true})
export default mongoose.model('CampusNews',schema)
