import asyncHandler from "../utils/asyncHandler.js";
import ApiError from '../utils/ApiError.js'
import {User} from '../models/user.model.js'
import uploadOnCloudinary from '../utils/cloudinary.js'
import ApiResponse from '../utils/ApiResponse.js'
import { verifyJWT } from "../middlewares/auth.middleware.js";

const genrateAcessAndRefreshToken = async(userId)=>{
  const user=await User.findById(userId);
  const accessToken=user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();
  user.refreshToken = refreshToken;
  await user.save({validateBeforeSave:false})
  return {accessToken,refreshToken}
}
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
     const existedUser =await User.findOne({
         $or:[{username},{email}]
     })

     if(existedUser){
        throw new ApiError(409,"This username or email already exists")
     }

      // check for images, check for avatar
      const avatarLocalPath = req.files?.avatar[0]?.path;
    //   const coverImageLocalPath = req.files?.avatar[0].path;
    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }
    

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

const loginUser = asyncHandler(async(req,res)=>{
  // req body -> data
    // username or email
    //find the user
    //password check
    //access and referesh token
    //send cookie
    const{email,password,username}= req.body;
    if(!email&&!username) throw new ApiError(400,"Username or Email is required for login");
    const user =await User.findOne({
      $or:[{email},{username}]
    })

    if(!user) throw new ApiError(404,"User do not exists");

   const isPasswordValid= await user.isPasswordCorrect(password)
   if(!isPasswordValid) throw new ApiError(401,"User credentials invalid");

  const {accessToken,refreshToken}= await genrateAcessAndRefreshToken(user._id);

  const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
  const option ={
    httpOnly:true,
    secure:true
  }
  return res
         .status(201)
         .cookie("accessToken",accessToken,option)
         .cookie("refreshToken",refreshToken,option)
         .json(
          new ApiResponse(200,{
            user:loggedInUser,accessToken,refreshToken
          },"User Login Successfully")
         )
  
})

const logOutUser = asyncHandler(async(req,res)=>{
  await User.findByIdAndUpdate(
    req.user._id,{
      $set:{
        refreshToken:undefined
      }
    },
    {
      new:true
    }
  )
  const option ={
    httpOnly:true,
    secure:true
  }
  return res
         .status(201)
         .clearCookie("accessToken",option)
         .clearCookie("refreshToken",option)
         .json(new ApiResponse(200, {}, "User logged Out"))
})

export  {
  registerUser,
  loginUser,
  logOutUser
}