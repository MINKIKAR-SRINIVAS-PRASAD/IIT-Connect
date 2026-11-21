import mongoose from 'mongoose'
const schema=new mongoose.Schema({channel:{type:mongoose.Schema.Types.ObjectId,ref:'FacultyChannel',required:true,index:true},sender:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},text:{type:String,required:true,trim:true,maxlength:3000}},{timestamps:true})
schema.index({channel:1,createdAt:1})
export default mongoose.model('FacultyMessage',schema)
