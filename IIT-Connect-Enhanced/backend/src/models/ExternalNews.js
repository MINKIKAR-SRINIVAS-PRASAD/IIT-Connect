import mongoose from 'mongoose'

const schema=new mongoose.Schema({
 id:{type:String,required:true,unique:true,index:true},
 category:{type:String,enum:['international','linkedin'],required:true,index:true},
 source:{type:String,required:true,trim:true},
 title:{type:String,required:true,trim:true},
 description:{type:String,default:''},
 url:{type:String,required:true,trim:true},
 date:{type:Date,default:null,index:true}
},{timestamps:true})

export default mongoose.model('ExternalNews',schema)
