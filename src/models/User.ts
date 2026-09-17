import mongoose,{Schema} from "mongoose";
const schema=new Schema({name:String,email:{type:String,required:true,unique:true,lowercase:true,index:true},passwordHash:{type:String,required:true,select:false},role:{type:String,enum:["admin","editor"],default:"admin"}},{timestamps:true});
export default mongoose.models.User||mongoose.model("User",schema);
