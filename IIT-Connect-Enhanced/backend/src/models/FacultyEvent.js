import mongoose from 'mongoose'
const schema=new mongoose.Schema({author:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true,index:true},title:{type:String,required:true,trim:true,maxlength:200},description:{type:String,default:'',maxlength:8000},startAt:{type:Date,required:true},venue:{type:String,default:''},institute:{type:String,required:true},registrationUrl:{type:String,default:''},imageUrl:{type:String,default:''},status:{type:String,enum:['Pending','Approved','Rejected'],default:'Pending',index:true},rejectionReason:{type:String,default:''}},{timestamps:true})
schema.index({startAt:1})
export default mongoose.model('FacultyEvent',schema)
