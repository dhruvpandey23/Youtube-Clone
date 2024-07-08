import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const {content}= req.body
    if(!content) throw new ApiError(400,"Enter some Content");
    const user = req.user?._id
    const tweet = await Tweet.create({
        content,
        owner:user
    })
    return res
    .status(201)  
    .json(new ApiResponse(201,tweet,"New Tweet is published now"))
})

const getUserTweets = asyncHandler(async (req, res) => {
    const { userId } = req.params
if (!userId) {
    throw new ApiError(400,"Give Valid User Id")
}
 const userTweets = await Tweet.find({owner:userId})
 if(!userTweets) throw new ApiError(404,"No Tweets yet");
 return res.status(201).json(new ApiResponse(201,userTweets,"User All tweets are fetched"))
    // TODO: get user tweets
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const { tweetId } = req.params
    if(!tweetId) throw new ApiError(400,"Enter valid tweet Id")
    const { content } = req.body
    if(!content) throw new ApiError(400,"Enter some content that you need to update")

   const updatedTweet = await Tweet.findByIdAndUpdate(tweetId,
        {
            $set:{
                content,
            }
        },{new:true})
        
        return res.status(201)
        .json(new ApiResponse(201,updatedTweet,"Tweet is updated"))
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const {tweetId} = req.params
    if(!tweetId) throw new ApiError(400,"Enter valid tweet Id");
    await Tweet.findByIdAndDelete(tweetId);

    return res
    .status(201)
    .json(new ApiResponse(201,{},"Your tweet is deleted"))
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}