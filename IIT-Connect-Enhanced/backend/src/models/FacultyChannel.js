import mongoose from 'mongoose'
const schema=new mongoose.Schema({title:{type:String,required:true,default:'Faculty Network'},participants:[{type:mongoose.Schema.Types.ObjectId,ref:'User'}],lastMessageAt:{type:Date,default:null}},{timestamps:true})
export default mongoose.model('FacultyChannel',schema)
