import mongoose from 'mongoose'
const postSchema = new mongoose.Schema({
 authorId:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true,index:true},
 section:{type:String,enum:['News','Campus','Events','Community','Travel','Study','Placements','Gallery'],required:true,index:true},
 caption:{type:String,required:true,maxlength:2000},
 imageUrl:{type:String,required:true},
 imagePublicId:{type:String,required:true},
 visibility:{type:String,enum:['public','private'],default:'public',index:true}
},{timestamps:true})
postSchema.index({visibility:1,section:1,createdAt:-1})
export default mongoose.model('CommunityPost',postSchema)
