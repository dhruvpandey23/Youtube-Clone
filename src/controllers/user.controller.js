import asyncHandler from "../utils/asyncHandler.js";
import ApiError from '../utils/ApiError.js'
import {User} from '../models/user.model.js'
import uploadOnCloudinary from '../utils/cloudinary.js'
import ApiResponse from '../utils/ApiResponse.js'
const registerUser = asyncHandler( async (req,res)=>{
     // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res
  
    // get user details from frontend
    const {fullname,email,password,username} = req.body
    
      // validation - not empty
    if(
      [fullname,email,username,password].some((field)=>field?.trim()==="")
      )
    {
      throw new ApiError(400, "All fields are required");
    }

    // check if user already exists: username, email 
     const existedUser =User.findOne({
         $or:[{username},{email}]
     })

     if(existedUser){
        throw new ApiError(409,"This username or email already exists")
     }

      // check for images, check for avatar
      const avatarLocalPath = req.files?.avatar[0]?.path;
      const coverImageLocalPath = req.files?.avatar[0].path;

      if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is required")
      }

      // upload them to cloudinary, avatar
      const avatar = await uploadOnCloudinary(avatarLocalPath);
      const coverImage = await uploadOnCloudinary(coverImageLocalPath)

      if(!avatar){
        throw new ApiError(400,"Avatar file is required")
      }

      // create user object - create entry in db
      const user = await User.create({
        fullname,
        email,
        password,
        username:username.toLowerCase(),
        avatar:avatar.url,
        coverImage:coverImage?.url || ""
      })

      // remove password and refresh token field from respons and check for user creation
      const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
      )

      if(!createdUser){
        throw new ApiError(500,"Something went wrong while registering the user")
      }

       // return res
       return res.status(201).json(
        new ApiResponse(201,createdUser,"User registered successfully")
       )
} )

export default registerUser