import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body
    const user = req.user?._id
    if(!user) throw new ApiError(404,"Login first then you will create playlist");
    if([name,description].some((field)=>field?.trim()===""))
        throw new ApiError(401,"Enter Name and description in the playlist");
    const playlist = await Playlist.create({
        name,
        description,
        owner:user
    })

    return res
    .status(201)
    .json(new ApiResponse(201,playlist,"Playlist is created"))

    //TODO: create playlist
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    if(!userId) throw new ApiError(400,"Enter valid userId");
    const userPlaylists = await Playlist.find({owner:userId});
    if(!userPlaylists) throw new ApiError(400,"Not Found any Playlist");
    return res.status(201).json(new ApiResponse(201,userPlaylists,"Users all playlist is fetched"))
    //TODO: get user playlists
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    if(!playlistId) throw new ApiError(400,"Enter the correct playlistId");
    const playlist = await Playlist.findById(playlistId);
    if(!playlist) throw new ApiError(400,"Playlist is not found");
    return res.status(201).json(new ApiResponse(201,playlist,"Playlist fetched successfully"))
    //TODO: get playlist by id
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    if([playlistId,videoId].some((field)=>field?.trim()==="")) throw new ApiError(400,"Enter VideoId and PlaylistId");
    const video = await Video.findById(videoId);
    if(!video) throw new ApiError(400,"Video is not found");
    const playlist = await Playlist.findByIdAndUpdate(playlistId,
        {
          $push:{
            videos:video,
          }
        },{new:true}
    );
    // playlist.videos.push(video);

    return res.status(201).json(new ApiResponse(201,playlist,"Video is added in the playlist"))

})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    if(!playlistId) throw new ApiError(400,"Playlist is not found");
    await Playlist.findByIdAndDelete(playlistId);
    return res.status(201).json(new ApiResponse(201,{},"Playlist is deleted"))
    // TODO: delete playlist
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    if(!playlistId) throw new ApiError(400,"PlaylistId is not correct");
    if(!name||!description) new ApiError(400,"Provide name and description both");
    const playlist = await Playlist.findByIdAndUpdate(playlistId,
        {
        $set:{
            name,
            description
        }
        },
        {new:true}
    )
    return res.status(201).json(201,playlist,"Your Name and description of the playlist is created");
    //TODO: update playlist
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}