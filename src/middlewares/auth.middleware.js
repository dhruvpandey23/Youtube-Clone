import { User } from "../models/user.model";
import ApiError from "../utils/ApiError";
import asyncHandler from "../utils/asyncHandler";
import jwt from 'jsonwebtoken'



export const verifyJWT= asyncHandler(async(req,res,next)=>{
 try {
    const token = req.cookie?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
   
    if(!token) throw new ApiError(401,"Unauthorized request");
   
    const decodeToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
   
    const user =await User.findById(decodeToken?._id).select("-password -refreshToken")
   
    if(!user) throw new ApiError(401,"Invalid Access Token");
   
    req.user = user;
    next();
 } catch (error) {
    throw new ApiError(401, error?.message || "Invalid access token");
 }
})