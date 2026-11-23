import mongoose from 'mongoose'
const schema=new mongoose.Schema({author:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true,index:true},title:{type:String,required:true,trim:true,maxlength:200},description:{type:String,default:'',maxlength:8000},subject:{type:String,required:true},resourceUrl:{type:String,default:''},institute:{type:String,required:true},tags:[String]status:{type:String,enum:['Pending','Approved','Rejected'],default:'Pending',index:true},rejectionReason:{type:String,default:''}},{timestamps:true})
export default mongoose.model('FacultyStudy',schema)
