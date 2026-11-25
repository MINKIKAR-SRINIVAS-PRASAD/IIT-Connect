import mongoose from 'mongoose'
const transportBookingSchema=new mongoose.Schema({
 ownerId:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true,index:true},
 transportType:{type:String,enum:['Train','Bus','Flight'],required:true},
 booking:{type:mongoose.Schema.Types.Mixed,required:true},
 status:{type:String,enum:['Saved','Cancelled'],default:'Saved'}
},{timestamps:true})
export default mongoose.model('TransportBooking',transportBookingSchema)
