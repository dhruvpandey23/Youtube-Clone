import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

 const connectDB = async () =>{
try {
    const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
    console.log(`Mongodb Connected!!! DB Host:${connectionInstance.connection.host}`)
    
} catch (error) {
    console.log("MONGODB connection failed",error)
    process.exit(1)
}
}  

console.log(process.env.MONGODB_URI)

export default connectDB