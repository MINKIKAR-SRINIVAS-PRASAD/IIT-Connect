import mongoose from 'mongoose'
const schema=new mongoose.Schema({author:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true,index:true},title:{type:String,required:true,trim:true,maxlength:200},details:{type:String,default:'',maxlength:5000},from:{type:String,required:true},to:{type:String,required:true},travelDate:{type:Date,required:true},institute:{type:String,required:true},contactNote:{type:String,default:''}},{timestamps:true})
schema.index({travelDate:1})
export default mongoose.model('FacultyTravel',schema)
