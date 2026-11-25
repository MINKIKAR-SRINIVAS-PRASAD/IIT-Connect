import mongoose from 'mongoose'

const externalNewsSchema=new mongoose.Schema({
 sourceKey:{type:String,required:true,unique:true,index:true},
 category:{type:String,enum:['international','linkedin'],required:true,index:true},
 source:{type:String,required:true,trim:true,maxlength:180},
 title:{type:String,required:true,trim:true,maxlength:1000},
 description:{type:String,default:'',maxlength:5000},
 url:{type:String,required:true,trim:true,maxlength:2000},
 date:{type:Date,default:null,index:true},
 firstSeenAt:{type:Date,default:Date.now},
 lastSeenAt:{type:Date,default:Date.now}
},{timestamps:true})

externalNewsSchema.index({date:-1,firstSeenAt:-1})
export default mongoose.model('ExternalNews',externalNewsSchema)
