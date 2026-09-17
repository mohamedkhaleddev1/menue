import mongoose,{Schema} from "mongoose";
const schema=new Schema({name:{type:String,required:true,trim:true,index:true},nameAr:{type:String,trim:true},slug:{type:String,required:true,unique:true,index:true},description:String,image:String,icon:String,order:{type:Number,default:0,index:true},active:{type:Boolean,default:true,index:true}},{timestamps:true});
export default mongoose.models.Category||mongoose.model("Category",schema);
