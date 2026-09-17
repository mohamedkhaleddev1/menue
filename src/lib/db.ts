import mongoose from "mongoose";
const URI=process.env.MONGODB_URI;
type Cache={conn:typeof mongoose|null;promise:Promise<typeof mongoose>|null};
const globalCache=globalThis as typeof globalThis&{mongooseCache?:Cache};
const cached:Cache=globalCache.mongooseCache??(globalCache.mongooseCache={conn:null,promise:null});
export async function connectDB(){if(!URI) throw new Error("MONGODB_URI is not configured");if(cached.conn)return cached.conn;if(!cached.promise)cached.promise=mongoose.connect(URI,{bufferCommands:false,serverSelectionTimeoutMS:3000,connectTimeoutMS:3000}).catch(error=>{cached.promise=null;throw error});cached.conn=await cached.promise;return cached.conn}
