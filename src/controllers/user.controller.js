import asyncHandler from "../utils/asyncHandler.js";
import ApiError from '../utils/ApiError.js'
import {User} from '../models/user.model.js'
import uploadOnCloudinary from '../utils/cloudinary.js'
import ApiResponse from '../utils/ApiResponse.js'
import { verifyJWT } from "../middlewares/auth.middleware.js";
import jwt from 'jsonwebtoken'

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

const refreshAccessToken = asyncHandler(async(req,res)=>{
  const incomingRefreshToken = await req.cookies.refreshToken||req.body.refreshToken

  if(!incomingRefreshToken) throw new ApiError(401,"unauthorized request");

  try {
    const decodeToken = jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)

    const user = await User.findById(decodeToken._id)
    if(!user) throw new ApiError(401,"Invalid Refresh Token");

      if(incomingRefreshToken!==user.refreshToken)  throw new ApiError(401, "Refresh token is expired or used");

      const option ={
        httpOnly:true,
        secure:true
      }

      const {accessToken,newRefreshToken} = await genrateAcessAndRefreshToken(user._id)
      return res
             .status(201)
             .cookie("accessToken",accessToken,option)
             .cookie("refreshToken",newRefreshToken,option)
             .json(
              new ApiResponse(
                200,{
                  accessToken,refreshToken:newRefreshToken
                },
                "Access token refreshed"
              )
             )
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token")
  }
  
})

const changeCurrentPassword = asyncHandler(async(req,res)=>{
  const{oldPassword,newPassword}=req.body;
  const user = await User.findById(req.user?._id);
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)
  if(!isPasswordCorrect) throw new ApiError(400,"Old Password is not correct");

  user.password = newPassword;
  await user.save({validateBeforeSave:false});

  return res
  .status(200)
  .json(new ApiResponse(200, {}, "Password changed successfully"))
})

const getCurrentUser = asyncHandler(async(req,res)=>{
  return res.status(200).json(new ApiResponse(200,req.user,"User fetched successfully"))
})

const updateAccountDetails = asyncHandler(async(req,res)=>{
  const {fullname,email} = req.body;
  if(!fullname||!email) throw new ApiError(400,"All fields are required");
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
        $set: {
            fullname,
             email
        }
    },
    {new: true}
    
).select("-password")

return res
.status(200)
.json(new ApiResponse(200, user, "Account details updated successfully"))
})

const updateUserAvatar = asyncHandler(async(req,res)=>{
  const avatarLocalPath = req.file?.path;

  if(!avatarLocalPath){
    throw new ApiError(400,"Avatar file is missing")
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if(!avatar.url){
    throw new ApiError(400,"Error while uploading on avatar");
  }
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
        $set:{
            avatar: avatar.url
        }
    },
    {new: true}
).select("-password")

return res
.status(200)
.json(
    new ApiResponse(200, user, "Avatar image updated successfully")
)
})

const updateUserCoverImage = asyncHandler(async(req,res)=>{
  const coverImageLocalPath = req.file?.path;

  if(!coverImageLocalPath){
    throw new ApiError(400,"coverImage file is missing")
  }

  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if(!coverImage.url){
    throw new ApiError(400,"Error while uploading on coverImage");
  }
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
        $set:{
          coverImage: coverImage.url
        }
    },
    {new: true}
).select("-password")

return res
.status(200)
.json(
    new ApiResponse(200, user, "coverimage updated successfully")
)
})

export  {
  registerUser,
  loginUser,
  logOutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
}