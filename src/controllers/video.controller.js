import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary,destroyCloudVideo,destroyCloudImage} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
     if(
         [title,description].some((field)=>field?.trim()==="")
     )
     {
         throw new ApiError(400,"Title and description of video is required")
     }
 
     const videoLocalPath = req.files?.videoFile[0].path;
     const thumbnailLocalPath = req.files?.thumbnail[0].path;
 
     if(!videoLocalPath){
         throw new ApiError(400,"Video is required")
     }
 
     if(!thumbnailLocalPath){
         throw new ApiError(400,"Thumbnail is required")
     }
 
     const video = await uploadOnCloudinary(videoLocalPath);
     const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
     console.log(video)
 
     const user = await User.findById(req.user._id).select("-password -coverImage -watchHistory -refreshToken");
 
     if(!user) throw ApiError(400,"User Details cannot get fetched please try again");
     const newVideo = await Video.create({
        title,
        description,
        videoFile: {
            public_id:video.public_id,
            url:video.secure_url,
        }, // Assuming `uploadOnCloudinary` returns an object with a `url` property
        thumbnail: {
            public_id:thumbnail.public_id,
            url:thumbnail.secure_url,
        },
        duration:video.duration,
        user: req.user._id,
    });

    if(!newVideo)
        {
            throw new ApiError(500,"There was a problem while uploading video")
        }

    return res.status(201).json(new ApiResponse(201, newVideo, "Video published successfully"));
})


const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if(!videoId)
        {
            throw new ApiError(400,"Video Id is required")
        }
    const video = await Video.findById(videoId)
    if(!video)
        {
            throw new ApiError(400,"No video exists with the id")
        }
    return res.status(201).json(new ApiResponse(201,video,"Video Fetched"))
    //TODO: get video by id
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const {title,description} = req.body;
    if([title,description].some((field)=>field?.trim()==="")){
        throw new ApiError(400,"Title and description is required");
    }

    const thumbnailLocalPath = req.file?.path;
    if(!thumbnailLocalPath) throw new ApiError(400,"Thumbnail file is required");

    const newThumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    const updatedVideo=await Video.findByIdAndUpdate(
        videoId,
        {
          $set:{
            title,
            description,
            thumbnail: {
                public_id:newThumbnail.public_id,
                url:newThumbnail.secure_url,
            },
          }
        },{new:true}
    )

    res.status(201)
    .json(new ApiResponse(201,updatedVideo,"Video title , description and thumbnail is updated"))

    // //TODO: update video details like title, description, thumbnail

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if(!videoId) new ApiError(400,"Please Provide Correct videId");

    const video =await Video.findById(videoId)
    if(!video) new ApiError(404,"Video not found");

    await destroyCloudVideo(video.videoFile.public_id);
    await destroyCloudImage(video.thumbnail.public_id);

    await Video.findByIdAndDelete(videoId);

    return res.status(201).json(
        new ApiResponse(201,{},"Deleted Successfully")
    )

    //TODO: delete video
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if(!videoId) new ApiError(400,"Please Provide Correct videId");

    const video =await Video.findById(videoId)
    if(!video) new ApiError(404,"Video not found");

    video.isPublished=!video.isPublished

    await video.save();

    return res.status(200)
        .json(new ApiResponse(200, video, "isPublished toggle Successfully"))


})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
