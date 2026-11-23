import mongoose from 'mongoose'
const schema=new mongoose.Schema({author:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true,index:true},caption:{type:String,default:'',maxlength:1000},imageUrl:{type:String,required:true},institute:{type:String,required:true}status:{type:String,enum:['Pending','Approved','Rejected'],default:'Pending',index:true},rejectionReason:{type:String,default:''}},{timestamps:true})
export default mongoose.model('FacultyGallery',schema)
