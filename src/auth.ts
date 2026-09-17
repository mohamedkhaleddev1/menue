import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import {z} from "zod";
import {connectDB} from "@/lib/db";
import User from "@/models/User";

export const {handlers,auth,signIn,signOut}=NextAuth({
  secret:process.env.AUTH_SECRET,
  session:{strategy:"jwt",maxAge:60*60*8},
  cookies:{sessionToken:{name:process.env.NODE_ENV==="production"?"__Secure-menu.session-token":"menu.session-token",options:{httpOnly:true,sameSite:"lax",path:"/",secure:process.env.NODE_ENV==="production"}}},
  pages:{signIn:"/admin/login"},
  providers:[Credentials({
    credentials:{email:{},password:{}},
    authorize:async raw=>{
      const {email,password}=z.object({email:z.string().email(),password:z.string().min(8)}).parse(raw);
      if(!process.env.MONGODB_URI&&process.env.NODE_ENV!=="production"){
        const validEmail=email.toLowerCase()===process.env.ADMIN_EMAIL?.toLowerCase();
        const validPassword=Boolean(process.env.ADMIN_PASSWORD)&&password===process.env.ADMIN_PASSWORD;
        return validEmail&&validPassword?{id:"local-admin",email,name:"Restaurant Owner"}:null;
      }
      await connectDB();
      const user=await User.findOne({email}).select("+passwordHash").lean();
      if(!user||!await bcrypt.compare(password,user.passwordHash))return null;
      return {id:String(user._id),email:user.email,name:user.name||"Admin"};
    }
  })]
});
