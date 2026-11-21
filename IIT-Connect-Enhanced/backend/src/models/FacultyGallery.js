import mongoose from 'mongoose'
const schema=new mongoose.Schema({author:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true,index:true},caption:{type:String,default:'',maxlength:1000},imageUrl:{type:String,required:true},institute:{type:String,required:true}},{timestamps:true})
export default mongoose.model('FacultyGallery',schema)
